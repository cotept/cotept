"use client"

import { useState } from "react"

import { HelpCircle } from "lucide-react"

import { Button } from "@repo/shared/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/components/form"
import { Input } from "@repo/shared/components/input"
import { RichTextEditor } from "@repo/shared/components/rich-text-editor"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/shared/components/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/shared/components/tooltip"
import { ValidationIndicator } from "@repo/shared/components/validation-indicator"
import { cn } from "@repo/shared/lib/utils"
import { StatusMessage } from "@repo/shared/src/components/status-message"

import { useMediaQuery } from "@uidotdev/usehooks"

import { useMentorProfileSetup } from "@/features/onboarding/hooks/useMentorProfileSetup"
import {
  type MentorIntroData,
  type MentorTagsData,
  type ProfileSetupData,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import { MentorProfilePreviewCard } from "@/shared/ui/MentorProfilePreviewCard"
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

const selectBaseClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"

export function MentorProfileSetupStep({ profile, initialData, onComplete }: MentorProfileSetupStepProps) {
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)") ?? false

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
  ) => (
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
              className={selectBaseClass}
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">멘토 태그</p>
            <p className="text-muted-foreground text-xs">직무 · 연차 · 회사 유형을 선택해주세요.</p>
          </div>
          {isLoadingTags && <span className="text-muted-foreground text-[11px]">불러오는 중...</span>}
        </div>

        {tagsError && (
          <StatusMessage
            variant="error"
            message={tagsError?.message ?? "태그 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}
          />
        )}

        <div className="grid gap-4">
          {renderTagSelect("jobTagId", "직무", "직무를 선택하세요", jobTags, "주로 멘토링할 직무 분야를 선택해주세요.")}
          {renderTagSelect(
            "levelTagId",
            "연차",
            "연차를 선택하세요",
            experienceTags,
            "멘토님의 경력 연차 수준을 선택해주세요.",
          )}
          {renderTagSelect(
            "companySizeTagId",
            "회사 규모",
            "회사 규모를 선택하세요",
            companySizeTags,
            "현재 또는 최근 회사의 규모를 선택해주세요.",
          )}
          {renderTagSelect(
            "companyTypeTagId",
            "회사 유형",
            "회사 유형을 선택하세요",
            companyTypeTags,
            "현재 또는 최근 회사의 유형을 선택해주세요.",
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <FormField
          control={form.control}
          name="introductionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>소개 제목 (선택)</FormLabel>
              <FormControl>
                <Input
                  placeholder="예: 7년차 백엔드 개발자, 대규모 서비스 리더"
                  {...field}
                  disabled={isPending}
                  className="bg-zinc-900"
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
                <FormLabel>소개 내용 *</FormLabel>
                <span className="text-muted-foreground text-xs">{introductionLength}/1000자</span>
              </div>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={handleIntroductionChange}
                  size="lg"
                  className={cn(
                    "bg-zinc-950",
                    formState.errors.introductionContent ? "border-red-500" : "border-zinc-800",
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

      <Button
        type="submit"
        className="w-full bg-purple-600 text-white hover:bg-purple-700"
        disabled={isPending || !form.formState.isValid}>
        {isPending ? (
          <>
            <InlineLoading className="mr-2" />
            저장 중...
          </>
        ) : (
          "멘토 프로필 저장"
        )}
      </Button>
    </form>
  )

  const sheetOpen = isDesktop ? true : isFormSheetOpen
  const handleSheetChange = (open: boolean) => {
    if (isDesktop) return
    setIsFormSheetOpen(open)
  }

  const previewCard = (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">실시간 프리뷰</p>
          <p className="text-muted-foreground text-xs">작성 중인 멘토 소개가 이 카드에 실시간으로 반영됩니다.</p>
        </div>
        {!isDesktop && (
          <Button
            size="sm"
            variant="secondary"
            className="bg-purple-500/10 text-xs text-purple-200 hover:bg-purple-500/20"
            onClick={() => setIsFormSheetOpen(true)}>
            정보 입력
          </Button>
        )}
      </div>
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
        className="border-zinc-800 bg-zinc-900"
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">{previewCard}</div>

        <Sheet open={sheetOpen} onOpenChange={handleSheetChange} modal={!isDesktop}>
          {!isDesktop && (
            <SheetTrigger asChild>
              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">멘토 정보 입력하기</Button>
            </SheetTrigger>
          )}
          <SheetContent
            side={isDesktop ? "right" : "bottom"}
            className={cn(
              "border-zinc-800 bg-zinc-950",
              isDesktop
                ? "lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[420px] lg:border-l lg:shadow-2xl"
                : "h-[90vh] border-t",
            )}>
            <SheetHeader className="text-left">
              <SheetTitle className="text-base text-white">멘토 정보 입력</SheetTitle>
              <p className="text-muted-foreground text-xs">
                태그와 소개글을 입력하면 왼쪽 프리뷰 카드가 즉시 업데이트됩니다.
              </p>
            </SheetHeader>
            <div className="custom-scrollbar mt-4 max-h-[calc(100%-4rem)] overflow-y-auto pr-1">
              <Form {...form}>{formContent}</Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
