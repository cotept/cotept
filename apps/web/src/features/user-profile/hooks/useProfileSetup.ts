import { useCallback, useState } from "react"

import { useSession } from "next-auth/react"

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

  const { mutate: createProfile, isPending: isCreating } = useCreateBasicProfile({
    onSuccess: ({ data: response }) => {
      if (!response) {
        toast.error("프로필 생성에 실패했습니다. 다시 시도해주세요.")
        setIsSubmitting(false)
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
      setIsSubmitting(false)
    },
    onSettled: () => setIsSubmitting(false),
  })

  const { mutate: getUploadUrl } = useGetUploadUrl()

  // 업로드 및 프로필 생성을 함께 처리하는 함수
  const uploadAndCreateProfile = useCallback(
    (formData: ProfileSetupFormData, imageFile: File, userId: string) => {
      setUploadError(null) // 오류 초기화
      setIsSubmitting(true)

      getUploadUrl(
        { generateUploadUrlRequestDto: { fileName: imageFile.name, contentType: imageFile.type } },
        {
          onSuccess: async ({ data: uploadData }) => {
            if (!uploadData) {
              const errorMsg = "업로드 정보를 받아오지 못했습니다."
              setUploadError(errorMsg)
              toast.error(errorMsg)
              setIsSubmitting(false)
              return
            }

            const { uploadUrl, fileUrl } = uploadData

            const uploadedUrl = await uploadFileToOCIObjectStorage(uploadUrl, imageFile)
            if (!uploadedUrl) {
              const errorMsg = "파일 업로드에 실패했습니다."
              setUploadError(errorMsg)
              setIsSubmitting(false)
              return
            }

            createProfile({
              createBasicProfileDto: {
                userId,
                nickname: formData.nickname,
                profileImageUrl: fileUrl,
              },
            })
          },
          onError: () => {
            const errorMsg = "업로드 URL을 받아오는데 실패했습니다."
            setUploadError(errorMsg)
            toast.error(errorMsg)
            setIsSubmitting(false)
          },
        },
      )
    },
    [getUploadUrl, createProfile],
  )

  // 재시도 함수 (uploadError가 있을 때 호출 가능)
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
    setUploadError(null) // 이미지 변경 시 기존 오류 초기화
    const tempPreviewUrl = URL.createObjectURL(file)
    setImagePreview(tempPreviewUrl)
    form.setValue("profileImage", file, { shouldValidate: true })
  }

  const handleSubmit = useCallback(
    (data: ProfileSetupFormData) => {
      const userId = session?.user?.id
      if (!userId) {
        toast.error("사용자 ID를 찾을 수 없습니다.")
        return
      }
      setIsSubmitting(true)

      const imageFile = data.profileImage
      if (imageFile instanceof File) {
        uploadAndCreateProfile(data, imageFile, userId)
      } else {
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
    uploadError, // 업로드 실패 메시지
    retryUploadAndCreateProfile, // 재시도 함수
  }
}
