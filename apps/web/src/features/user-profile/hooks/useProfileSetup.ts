import { useCallback, useMemo, useState } from "react"

import { useSession } from "next-auth/react"

import { UploadType } from "@repo/api-client/src"
import { ValidationCheck } from "@repo/shared/components/validation-indicator"
import { createValidationChecks, validateField } from "@repo/shared/src/rules/rule-helper"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { useCreateBasicProfile } from "@/features/onboarding/api/mutations"
import {
  type ProfileSetupData,
  type ProfileSetupFormData,
  ProfileSetupFormRules,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import { handleApiError } from "@/shared/api/core/errors/handlers"
import { useGetUploadUrl } from "@/shared/hooks/useStorage"
import { uploadFileToOCIObjectStorage } from "@/shared/utils"

export const useProfileSetup = ({ onComplete }: { onComplete: (data: ProfileSetupData) => void }) => {
  const { data: session } = useSession()
  const form = useForm<ProfileSetupFormData>({
    resolver: zodResolver(ProfileSetupFormRules),
    defaultValues: { nickname: "", profileImage: undefined },
    mode: "onChange",
  })
  const nickname = useWatch({ control: form.control, name: "nickname" })
  const profileImage = useWatch({ control: form.control, name: "profileImage" })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    typeof profileImage === "string" ? profileImage : null,
  )

  const validationChecks: ValidationCheck[] = useMemo(() => {
    const fieldValidation = validateField(ProfileSetupFormRules.shape.nickname, nickname)
    return createValidationChecks(fieldValidation, [
      {
        id: "length",
        label: "2자 이상 20자 이하",
        isIssuePresent: (issues) => issues.some((i) => i.code === "too_small" || i.code === "too_big"),
      },
      {
        id: "chars",
        label: "한글과 영문만 사용",
        isIssuePresent: (issues) => issues.some((i) => i.code === "invalid_string"),
      },
    ])
  }, [nickname])

  const { mutate: createProfile, isPending: isCreating } = useCreateBasicProfile({
    onSuccess: ({ data: response }) => {
      if (!response) return
      const { nickname, profileImageUrl } = response
      toast.success("프로필이 저장되었습니다.")
      onComplete({ nickname, profileImageUrl: profileImageUrl ?? undefined })
    },
    onError: (error) => {
      // useBaseMutation에서 이미 처리가 된 에러가 넘어옵니다 (ProcessedError)
      const message = (error as any).message || "알 수 없는 오류가 발생했습니다."
      toast.error(message)
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const { mutateAsync: getUploadUrlAsync } = useGetUploadUrl()

  const uploadAndCreateProfile = useCallback(
    async (formData: ProfileSetupFormData, imageFile: File, userId: string) => {
      setUploadError(null)
      setIsSubmitting(true)

      try {
        const { data: uploadData } = await getUploadUrlAsync({
          generateUploadUrlRequestDto: {
            fileName: imageFile.name,
            contentType: imageFile.type,
            uploadType: UploadType.USER_PROFILE,
          },
        })

        if (!uploadData) {
          const errorMsg = "업로드 정보를 받아오지 못했습니다."
          setUploadError(errorMsg)
          toast.error(errorMsg)
          setIsSubmitting(false)
          return
        }

        const uploadedUrl = await uploadFileToOCIObjectStorage(uploadData.uploadUrl, imageFile)
        if (!uploadedUrl) {
          setUploadError("파일 업로드에 실패했습니다.")
          setIsSubmitting(false)
          return
        }

        createProfile({
          createBasicProfileDto: {
            userIdx: session!.member.idx,
            userId,
            nickname: formData.nickname,
            profileImageUrl: uploadData.fileUrl,
          },
        })
      } catch (error) {
        const handledError = handleApiError(error)
        setUploadError(handledError.message)
        toast.error(handledError.message)
        setIsSubmitting(false)
      }
    },
    [getUploadUrlAsync, createProfile, session],
  )

  const retryUploadAndCreateProfile = useCallback(() => {
    const data = form.getValues()
    const imageFile = data.profileImage
    const userId = session?.member?.idx.toString() || null
    if (!imageFile || !(imageFile instanceof File) || !userId) {
      toast.error("재시도할 수 없습니다. 사용자 정보 또는 이미지가 유효하지 않습니다.")
      return
    }
    uploadAndCreateProfile(data, imageFile, userId)
  }, [form, session, uploadAndCreateProfile])

  const handleImageSelect = (file?: File | null) => {
    if (!file) {
      setImagePreview(null)
      form.setValue("profileImage", undefined, { shouldValidate: true })
      return
    }

    const fieldValidation = validateField(ProfileSetupFormRules.shape.profileImage, file)

    if (!fieldValidation.isValid) {
      toast.error(fieldValidation.errorMessage || "유효하지 않은 파일입니다.")
      form.setError("profileImage", { type: "manual", message: fieldValidation.errorMessage })
      form.setValue("profileImage", undefined, { shouldValidate: true })
      return
    }

    setUploadError(null)
    const tempPreviewUrl = URL.createObjectURL(file)
    setImagePreview(tempPreviewUrl)
    form.setValue("profileImage", file, { shouldValidate: true })
  }

  const handleSubmit = useCallback(
    (data: ProfileSetupFormData) => {
      // 🔧 중복 제출 방지: 이미 제출 중이면 무시
      if (isSubmitting || isCreating) {
        return
      }

      const userId = session?.member.userId
      if (!userId) {
        toast.error("사용자 ID를 찾을 수 없습니다.")
        return
      }

      const imageFile = data.profileImage
      if (imageFile instanceof File) {
        uploadAndCreateProfile(data, imageFile, userId)
      } else {
        setIsSubmitting(true)
        createProfile({
          createBasicProfileDto: {
            userIdx: session!.member.idx,
            userId,
            nickname: data.nickname,
          },
        })
      }
    },
    [session, createProfile, uploadAndCreateProfile, isSubmitting, isCreating],
  )

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isPending: isSubmitting || isCreating,
    nickname,
    profileImage,
    imagePreview,
    handleImageSelect,
    uploadError,
    retryUploadAndCreateProfile,
    validationChecks,
  }
}
