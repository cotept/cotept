import { useCallback, useEffect, useMemo, useRef } from "react"

import { useSession } from "next-auth/react"

import type { MentorTagDto } from "@repo/api-client/src/types/mentor-tag-dto"
import { ValidationCheck } from "@repo/shared/components/validation-indicator"
import { sanitizeHtml, sanitizeToPlainText } from "@repo/shared/lib/sanitize"
import { createValidationChecks, validateField } from "@repo/shared/src/rules/rule-helper"

import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultValues, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useCreateMentorProfileOnboarding } from "@/features/onboarding/api/mutations"
import { useGetMentorTags } from "@/features/onboarding/api/queries"
import {
  MentorIntroData,
  MentorProfileSetupFormData,
  MentorProfileSetupFormRules,
  MentorTagsData,
  transformToMentorProfileDto,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import { handleApiError } from "@/shared/api/core/errors/handlers"

type MentorProfileSnapshot = {
  tags: MentorTagsData
  intro: MentorIntroData
}

interface UseMentorProfileSetupOptions {
  initialData?: MentorProfileSnapshot
  onComplete?: (data: MentorProfileSnapshot) => void
}

interface MentorProfilePreviewData {
  jobTag?: MentorTagDto
  levelTag?: MentorTagDto
  companySizeTag?: MentorTagDto
  companyTypeTag?: MentorTagDto
  introTitle?: string
  introContent: string
}

export function useMentorProfileSetup({ initialData, onComplete }: UseMentorProfileSetupOptions = {}) {
  const { data: session } = useSession()
  const userId = session?.member?.userId ?? null

  const defaultValues = useMemo<DefaultValues<MentorProfileSetupFormData>>(
    () => ({
      jobTagId: initialData?.tags.jobTagId,
      levelTagId: initialData?.tags.levelTagId,
      companySizeTagId: initialData?.tags.companySizeTagId,
      companyTypeTagId: initialData?.tags.companyTypeTagId,
      introductionTitle: initialData?.intro.introductionTitle ?? "",
      introductionContent: initialData?.intro.introductionContent
        ? sanitizeHtml(initialData.intro.introductionContent)
        : "",
    }),
    [initialData],
  )

  const form = useForm<MentorProfileSetupFormData>({
    resolver: zodResolver(MentorProfileSetupFormRules),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        jobTagId: initialData.tags.jobTagId,
        levelTagId: initialData.tags.levelTagId,
        companySizeTagId: initialData.tags.companySizeTagId,
        companyTypeTagId: initialData.tags.companyTypeTagId,
        introductionTitle: initialData.intro.introductionTitle ?? "",
        introductionContent: sanitizeHtml(initialData.intro.introductionContent),
      })
    }
  }, [initialData, form])

  const pendingPayloadRef = useRef<MentorProfileSnapshot | null>(null)

  const {
    data: mentorTagsResponse,
    isLoading: isLoadingTags,
    error: tagsError,
  } = useGetMentorTags({ enabled: !!userId })
  console.log({ mentorTagsResponse })
  const jobTags = useMemo<MentorTagDto[]>(() => mentorTagsResponse?.data?.jobTags ?? [], [mentorTagsResponse])
  const experienceTags = useMemo<MentorTagDto[]>(
    () => mentorTagsResponse?.data?.experienceTags ?? [],
    [mentorTagsResponse],
  )
  const companySizeTags = useMemo<MentorTagDto[]>(
    () => mentorTagsResponse?.data?.companySizeTags ?? [],
    [mentorTagsResponse],
  )
  const companyTypeTags = useMemo<MentorTagDto[]>(
    () => mentorTagsResponse?.data?.companyTypeTags ?? [],
    [mentorTagsResponse],
  )

  const jobTagId = form.watch("jobTagId")
  const levelTagId = form.watch("levelTagId")
  const companySizeTagId = form.watch("companySizeTagId")
  const companyTypeTagId = form.watch("companyTypeTagId")
  const introductionTitle = form.watch("introductionTitle") ?? ""
  const introductionContent = form.watch("introductionContent") ?? ""

  const introductionPlainText = useMemo(() => sanitizeToPlainText(introductionContent), [introductionContent])
  const introductionLength = introductionPlainText.length

  const previewData = useMemo<MentorProfilePreviewData>(
    () => ({
      jobTag: jobTags.find((tag) => tag.idx === jobTagId),
      levelTag: experienceTags.find((tag) => tag.idx === levelTagId),
      companySizeTag: companySizeTags.find((tag) => tag.idx === companySizeTagId),
      companyTypeTag: companyTypeTags.find((tag) => tag.idx === companyTypeTagId),
      introTitle: introductionTitle?.trim() ? introductionTitle : undefined,
      introContent: introductionContent,
    }),
    [
      jobTags,
      experienceTags,
      companySizeTags,
      companyTypeTags,
      jobTagId,
      levelTagId,
      companySizeTagId,
      companyTypeTagId,
      introductionTitle,
      introductionContent,
    ],
  )

  const validationChecks = useMemo<ValidationCheck[]>(() => {
    const fieldValidation = validateField(MentorProfileSetupFormRules.shape.introductionContent, introductionContent)
    return createValidationChecks(fieldValidation, [
      {
        id: "min",
        label: "10자 이상",
        isIssuePresent: () => introductionPlainText.trim().length < 10,
      },
      {
        id: "max",
        label: "1000자 이하",
        isIssuePresent: () => introductionPlainText.trim().length > 1000,
      },
    ])
  }, [introductionContent, introductionPlainText])

  const handleIntroductionChange = useCallback(
    (value: string) => {
      const safeValue = sanitizeHtml(value)
      form.setValue("introductionContent", safeValue, { shouldValidate: true, shouldDirty: true })
    },
    [form],
  )

  const { mutate: createMentorProfile, isPending } = useCreateMentorProfileOnboarding({
    onSuccess: () => {
      toast.success("멘토 프로필이 저장되었습니다.")
      if (pendingPayloadRef.current) {
        onComplete?.(pendingPayloadRef.current)
        pendingPayloadRef.current = null
      }
    },
    onError: (error) => {
      const handledError = handleApiError(error)
      toast.error(handledError.message)
      pendingPayloadRef.current = null
    },
  })

  const handleFormSubmit = useCallback(
    (formData: MentorProfileSetupFormData) => {
      if (!userId) {
        toast.error("사용자 정보를 찾을 수 없습니다.")
        return
      }

      const tagsPayload: MentorTagsData = {
        jobTagId: formData.jobTagId,
        levelTagId: formData.levelTagId,
        companySizeTagId: formData.companySizeTagId,
        companyTypeTagId: formData.companyTypeTagId,
      }

      const introPayload: MentorIntroData = {
        introductionTitle: formData.introductionTitle?.trim() ? formData.introductionTitle.trim() : undefined,
        introductionContent: formData.introductionContent,
      }

      pendingPayloadRef.current = { tags: tagsPayload, intro: introPayload }

      createMentorProfile({
        onboardingCreateMentorProfileDto: transformToMentorProfileDto(userId, tagsPayload, introPayload),
      })
    },
    [userId, createMentorProfile],
  )

  return {
    form,
    handleSubmit: form.handleSubmit(handleFormSubmit),
    handleIntroductionChange,
    jobTags,
    experienceTags,
    companySizeTags,
    companyTypeTags,
    isLoadingTags,
    tagsError,
    previewData,
    validationChecks,
    introductionLength,
    introductionPlainText,
    isPending,
  }
}
