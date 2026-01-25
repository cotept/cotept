"use client"

import { useState } from "react"

import { Button } from "@repo/shared/components/button"
import { ComboBox, type ComboBoxOption } from "@repo/shared/components/combo-box"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/components/form"
import { Input } from "@repo/shared/components/input"
import { RichTextEditor } from "@repo/shared/components/rich-text-editor"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/shared/components/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/shared/components/tooltip"
import { ValidationIndicator } from "@repo/shared/components/validation-indicator"
import { cn } from "@repo/shared/lib/utils"
import { StatusMessage } from "@repo/shared/src/components/status-message"

import { HelpCircle } from "lucide-react"

import { MentorProfilePreviewCard } from "@/features/onboarding/components/MentorProfilePreviewCard"
import { useMentorProfileSetup } from "@/features/onboarding/hooks/useMentorProfileSetup"
import {
  type MentorIntroData,
  type MentorTagsData,
  type ProfileSetupData,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import useViewportSize from "@/shared/hooks/useViewportSize"
import { InlineLoading } from "@/shared/ui/loading"

type MentorProfileSnapshot = {
  tags: MentorTagsData
  intro: MentorIntroData
}

interface MentorProfileSetupStepProps {
  profile?: ProfileSetupData
  initialData?: MentorProfileSnapshot
  onComplete: (data: MentorProfileSnapshot) => void
}

export function MentorProfileSetupStep({ profile, initialData, onComplete }: MentorProfileSetupStepProps) {
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const { isLgUp } = useViewportSize()
  const {
    form,
    handleSubmit,
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
    isPending,
  } = useMentorProfileSetup({ initialData, onComplete })

  const renderTagSelect = (
    name: keyof MentorTagsData,
    label: string,
    placeholder: string,
    options: { idx: number; name: string }[],
    tooltip: string,
    useComboBox = false, // 검색 기능이 필요한 경우만 true
  ) => {
    // ComboBox 사용 시 (직무처럼 옵션이 많은 경우)
    if (useComboBox) {
      const comboBoxOptions: ComboBoxOption[] = options.map((option) => ({
        value: String(option.idx),
        label: option.name,
        disabled: false,
      }))

      return (
        <FormField
          key={name}
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-1">
                <FormLabel>{label}</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground" aria-label={`${label} 안내`}>
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <ComboBox
                  options={comboBoxOptions}
                  value={field.value !== undefined ? String(field.value) : undefined}
                  onChange={(nextValue) => {
                    field.onChange(nextValue ? Number(nextValue) : undefined)
                  }}
                  placeholder={placeholder}
                  searchPlaceholder={`${label} 검색...`}
                  emptyText="검색 결과가 없습니다."
                  disabled={isLoadingTags || isPending}
                  buttonClassName="w-full border-border bg-background text-muted-foreground hover:bg-muted/80"
                  popoverClassName="w-[var(--radix-popover-trigger-width)]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }

    // 네이티브 select 사용 (기본 - 옵션이 적은 경우)
    return (
      <FormField
        key={name}
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-1">
              <FormLabel>{label}</FormLabel>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground" aria-label={`${label} 안내`}>
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            </div>
            <FormControl>
              <select
                className={cn(
                  "border-border bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                  field.value ? "text-foreground" : "text-muted-foreground",
                )}
                value={field.value ?? ""}
                onChange={(event) => {
                  const nextValue = event.target.value
                  field.onChange(nextValue ? Number(nextValue) : undefined)
                }}
                disabled={isLoadingTags || isPending}>
                <option value="">{placeholder}</option>
                {options.map((option) => (
                  <option key={option.idx} value={option.idx}>
                    {option.name}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-bg-4/50 border-border space-y-4 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          {isLoadingTags && <span className="text-muted-foreground text-[11px]">불러오는 중...</span>}
        </div>

        {tagsError && (
          <StatusMessage
            variant="error"
            message={tagsError?.message ?? "태그 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}
          />
        )}

        <div className="grid gap-4">
          {renderTagSelect(
            "jobTagId",
            "직무",
            "직무를 선택해주세요",
            jobTags,
            "주로 멘토링할 직무 분야를 선택해주세요.",
            true,
          )}
          {renderTagSelect(
            "levelTagId",
            "연차",
            "연차를 선택해주세요",
            experienceTags,
            "멘토님의 경력 연차 수준을 선택해주세요.",
          )}
          {renderTagSelect(
            "companySizeTagId",
            "회사 규모",
            "회사 규모를 선택해주세요",
            companySizeTags,
            "현재 또는 최근 회사의 규모를 선택해주세요.",
          )}
          {renderTagSelect(
            "companyTypeTagId",
            "회사 유형",
            "회사 유형을 선택해주세요",
            companyTypeTags,
            "현재 또는 최근 회사의 유형을 선택해주세요.",
          )}
        </div>
      </section>

      <section className="bg-bg-4/50 border-border space-y-4 rounded-xl border p-4">
        <FormField
          control={form.control}
          name="introductionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목 (선택)</FormLabel>
              <FormControl>
                <Input
                  placeholder="예: 7년차 백엔드 개발자, 대규모 서비스 리더"
                  {...field}
                  disabled={isPending}
                  className="bg-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="introductionContent"
          render={({ field, formState }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>본문 *</FormLabel>
                <span className="text-muted-foreground text-xs">{introductionLength}/1000자</span>
              </div>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={handleIntroductionChange}
                  size="lg"
                  className={cn(
                    "bg-background",
                    formState.errors.introductionContent ? "border-destructive" : "border-input",
                  )}
                />
              </FormControl>
              <ValidationIndicator
                checks={validationChecks}
                isDirty={Boolean(formState.dirtyFields.introductionContent)}
                variant="compact"
                size="sm"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    </form>
  )
  const submitButton = (
    <Button
      type="submit"
      form="mentor-profile-form" // 폼 ID 연결
      className="w-full"
      variant="auth-primary"
      disabled={isPending || !form.formState.isValid}>
      {isPending ? (
        <>
          <InlineLoading className="mr-2" />
          저장 중...
        </>
      ) : (
        "저장"
      )}
    </Button>
  )

  const sheetOpen = isLgUp ? true : isFormSheetOpen
  const handleSheetChange = (open: boolean) => {
    if (isLgUp) return
    setIsFormSheetOpen(open)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <MentorProfilePreviewCard
            nickname={profile?.nickname ?? "멘토 닉네임"}
            profileImageUrl={profile?.profileImageUrl}
            jobTag={previewData.jobTag}
            levelTag={previewData.levelTag}
            companySizeTag={previewData.companySizeTag}
            companyTypeTag={previewData.companyTypeTag}
            introductionTitle={previewData.introTitle}
            introductionContent={previewData.introContent}
            isSubmitted={false}
            className="border-border bg-background"
          />
        </div>

        <Sheet open={sheetOpen} onOpenChange={handleSheetChange} modal={!isLgUp}>
          {!isLgUp && (
            <SheetTrigger asChild>
              <Button className="w-full" variant="auth-primary">
                멘토 정보 입력하기
              </Button>
            </SheetTrigger>
          )}

          <SheetContent
            side={isLgUp ? "right" : "bottom"}
            className={cn(
              "border-border bg-background",
              isLgUp
                ? "lg:w-md p-4 lg:inset-y-0 lg:right-0 lg:h-auto lg:max-w-md lg:border-l lg:shadow-2xl"
                : "h-[90vh] border-t",
            )}>
            <SheetHeader className="pb-0">
              <SheetTitle className="text-foreground text-lg font-semibold">멘토 프로필 설정</SheetTitle>
            </SheetHeader>
            <div className="custom-scrollbar overflow-y-auto pr-1">
              <Form {...form}>{formContent}</Form>
            </div>
            <div className="border-border shrink-0 border-t pt-4">{submitButton}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
