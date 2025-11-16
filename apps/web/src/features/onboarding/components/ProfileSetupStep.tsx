"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/shared/components/avatar"
import { Button } from "@repo/shared/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@repo/shared/components/form"
import { Input } from "@repo/shared/components/input"
import { ValidationIndicator } from "@repo/shared/components/validation-indicator"

import { Camera } from "lucide-react"

import {
  PROFILE_IMAGE_ACCEPT_STRING,
  type ProfileSetupData,
} from "@/features/onboarding/lib/validations/onboarding-rules"
import { useProfileSetup } from "@/features/user-profile/hooks/useProfileSetup"
import { InlineLoading } from "@/shared/ui/loading"

export function ProfileSetupStep({ onComplete }: { onComplete: (data: ProfileSetupData) => void }) {
  const {
    form,
    handleSubmit,
    isPending,
    // nickname,
    imagePreview,
    handleImageSelect,
    uploadError,
    retryUploadAndCreateProfile,
    validationChecks,
  } = useProfileSetup({ onComplete })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
        <FormField
          control={form.control}
          name="profileImage"
          render={() => (
            <FormItem>
              <FormControl>
                <label className="relative cursor-pointer">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview ?? undefined} />
                    <AvatarFallback className="bg-zinc-700">
                      <Camera className="h-8 w-8 text-zinc-400" />
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    className="hidden"
                    accept={PROFILE_IMAGE_ACCEPT_STRING}
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                    disabled={isPending}
                  />
                </label>
              </FormControl>
            </FormItem>
          )}
        />

        {uploadError && (
          <div className="text-center text-sm text-red-500">
            <p>{uploadError}</p>
            <Button variant="link" size="sm" onClick={retryUploadAndCreateProfile} disabled={isPending}>
              재시도
            </Button>
          </div>
        )}

        <FormField
          control={form.control}
          name="nickname"
          render={({ field, formState }) => (
            <FormItem className="w-full">
              <FormLabel>닉네임 *</FormLabel>
              <FormControl>
                <Input placeholder="사용하실 닉네임을 입력하세요" {...field} className="bg-zinc-800" />
              </FormControl>
              <div className="pt-2">
                <ValidationIndicator
                  checks={validationChecks}
                  isDirty={formState.dirtyFields.nickname}
                  variant="compact"
                  size="sm"
                />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-purple-600 text-white hover:bg-purple-700" disabled={isPending}>
          {isPending ? (
            <>
              <InlineLoading className="mr-2" />
              저장 중...
            </>
          ) : (
            "다음 단계"
          )}
        </Button>
      </form>
    </Form>
  )
}
