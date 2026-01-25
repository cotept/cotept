"use client"

import React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/shared/components/alert-dialog"
import { Button } from "@repo/shared/components/button"

import { ShieldCheck, Sparkles, Users } from "lucide-react"

import { createOverlayHelper } from "@/shared/hooks/useOverlay"
import { OVERLAY_ANIMATION_DURATION } from "@/shared/ui/overlay/constants"
import { type OpenOverlayAsyncOptions, OverlayAsyncControllerProps } from "@/shared/ui/overlay/types/overlay.types"

interface MentorProposalModalProps extends OverlayAsyncControllerProps<boolean> {
  tierLabel?: string | number
  baekjoonHandle?: string
}

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "검증된 멘토 배지",
    description: "Platinum III+ 실력을 기반으로 한 신뢰성 있는 멘토로 노출됩니다.",
  },
  {
    icon: Users,
    title: "멘토링 세션 관리",
    description: "세션 개설, 일정 관리, 정산 요약 등 멘토 전용 도구를 사용할 수 있습니다.",
  },
  {
    icon: Sparkles,
    title: "지식 나눔 & 수익화",
    description: "멘티들과의 실시간 협업과 멘토링을 통해 전문성을 전파하고 보상을 받을 수 있습니다.",
  },
]

export const MentorProposalModal: React.FC<MentorProposalModalProps> = ({
  isOpen,
  close,
  unmount,
  tierLabel,
  baekjoonHandle,
}) => {
  const timerRef = React.useRef<NodeJS.Timeout>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const dismiss = (accepted: boolean) => {
    close(accepted)
    timerRef.current = setTimeout(() => unmount(), OVERLAY_ANIMATION_DURATION)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dismiss(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="flex items-center justify-center gap-2 text-2xl font-semibold">
            <Sparkles className="text-primary h-4 w-4" />
            멘토로 활동해보시겠어요?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-base">
            백준 <span className="font-semibold">{baekjoonHandle ? `@${baekjoonHandle}` : ""}</span>계정이{" "}
            <span className="font-semibold">{tierLabel ?? "Platinum"}</span> 티어 기준을 충족했습니다. 멘토로 전환하면
            다음 기능들을 사용할 수 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="border-border/60 bg-muted/40 text-muted-foreground space-y-3 rounded-lg border px-4 py-3 text-sm">
          <ul className="space-y-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex items-start justify-center rounded-full p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">{title}</p>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={() => dismiss(false)}>
            나중에 하기
          </Button>
          <AlertDialogAction asChild>
            <Button variant="auth-primary" className="w-full sm:w-auto" onClick={() => dismiss(true)}>
              멘토 프로필 설정하기
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type MentorProposalModalPublicProps = Omit<MentorProposalModalProps, keyof OverlayAsyncControllerProps<boolean>>

const mentorProposalHelper = createOverlayHelper<MentorProposalModalPublicProps, boolean>(MentorProposalModal)

export const openMentorProposalModal = (
  props: MentorProposalModalPublicProps,
  options?: OpenOverlayAsyncOptions<boolean>,
) => mentorProposalHelper(props, { rejectOnDismiss: false, dismissValue: false, ...options })
