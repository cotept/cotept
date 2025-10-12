import { useCallback, useMemo, useState } from "react"

import { useSession } from "next-auth/react"

import { ValidationCheck } from "@repo/shared/components/validation-indicator"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useCreateBasicProfile } from "@/features/onboarding/api/mutations"
import {
  type ProfileSetupFormData,
  ProfileSetupFormRules,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import { useOnboardingFlowStore } from "@/features/onboarding/store/useOnboardingFlowStore"
import { useProfileStore } from "@/features/user-profile/store/useProfileStore"
import { AuthErrorHandler } from "@/shared/auth/errors/handler"
import { useGetUploadUrl } from "@/shared/hooks/useStorage"
import { uploadFileToOCIObjectStorage } from "@/shared/utils"

function getNicknameValidationState(nickname: string) {
  if (!nickname) return { lengthValid: false, charsValid: false }

  const result = ProfileSetupFormRules.pick({ nickname: true }).safeParse({ nickname })
  if (result.success) return { lengthValid: true, charsValid: true }

  const errors = result.error.flatten().fieldErrors.nickname || []
  const lengthValid = !errors.some((e) => e.includes("2자 이상") || e.includes("20자 이하"))
  const charsValid = !errors.some((e) => e.includes("한글, 영문, 숫자"))

  return { lengthValid, charsValid }
}

function getImageValidationState(image: File | string | null | undefined) {
  if (!image || !(image instanceof File)) return { isValid: true, errors: [] }

  const result = ProfileSetupFormRules.pick({ profileImage: true }).safeParse({ profileImage: image })
  if (result.success) return { isValid: true, errors: [] }

  return { isValid: false, errors: result.error.flatten().fieldErrors.profileImage || [] }
}

export const useProfileSetup = () => {
  const { profile, setProfile } = useProfileStore()
  const { goToNextStep } = useOnboardingFlowStore()
  const { data: session } = useSession()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(profile.profileImageUrl || null)

  const form = useForm<ProfileSetupFormData>({
    resolver: zodResolver(ProfileSetupFormRules),
    defaultValues: { nickname: profile.nickname || "", profileImage: profile.profileImageUrl || "" },
    mode: "onChange",
  })

  const nickname = form.watch("nickname")
  const profileImage = form.watch("profileImage")

  const validationChecks: ValidationCheck[] = useMemo(() => {
    const { lengthValid, charsValid } = getNicknameValidationState(nickname)
    return [
      { id: "length", label: "2자 이상 20자 이하", isValid: lengthValid },
      { id: "chars", label: "한글, 영문, 숫자만 사용", isValid: charsValid },
    ]
  }, [nickname])

  const { mutate: createProfile, isPending: isCreating } = useCreateBasicProfile({
    onSuccess: ({ data: response }) => {
      if (!response) {
        toast.error("프로필 생성에 실패했습니다. 다시 시도해주세요.")
        return
      }
      const { userId, nickname, profileImageUrl } = response
      setProfile({ userId, nickname, profileImageUrl })
      toast.success("프로필이 저장되었습니다.")
      goToNextStep()
    },
    onError: (error) => {
      const handledError = AuthErrorHandler.handle(error)
      toast.error(handledError.message)
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
          generateUploadUrlRequestDto: { fileName: imageFile.name, contentType: imageFile.type },
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
            userId,
            nickname: formData.nickname,
            profileImageUrl: uploadData.fileUrl,
          },
        })
      } catch (error) {
        const handledError = AuthErrorHandler.handle(error)
        setUploadError(handledError.message)
        toast.error(handledError.message)
        setIsSubmitting(false)
      }
    },
    [getUploadUrlAsync, createProfile],
  )

  const retryUploadAndCreateProfile = useCallback(() => {
    const data = form.getValues()
    const imageFile = data.profileImage
    const userId = session?.user?.id
    if (!imageFile || !(imageFile instanceof File) || !userId) {
      toast.error("재시도할 수 없습니다. 사용자 정보 또는 이미지가 유효하지 않습니다.")
      return
    }
    uploadAndCreateProfile(data, imageFile, userId)
  }, [form, session, uploadAndCreateProfile])

  const handleImageSelect = (file: File) => {
    if (!file) return

    const { isValid, errors } = getImageValidationState(file)
    if (!isValid) {
      toast.error(errors[0] || "유효하지 않은 파일입니다.")
      form.setError("profileImage", { type: "manual", message: errors[0] })
      return
    }

    setUploadError(null)
    const tempPreviewUrl = URL.createObjectURL(file)
    setImagePreview(tempPreviewUrl)
    form.setValue("profileImage", file, { shouldValidate: true })
    getUploadUrlAsync({ generateUploadUrlRequestDto: { fileName: file.name, contentType: file.type } })
  }

  const handleSubmit = useCallback(
    (data: ProfileSetupFormData) => {
      const userId = session?.user?.id
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
            userId,
            nickname: data.nickname,
          },
        })
      }
    },
    [session, createProfile, uploadAndCreateProfile],
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
