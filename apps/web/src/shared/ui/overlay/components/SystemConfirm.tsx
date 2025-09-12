"use client"
/**
 * SystemConfirm - Overlay 시스템용 Confirm Dialog 컴포넌트
 *
 * shadcn/ui AlertDialog를 overlay-kit 호환 인터페이스로 래핑
 * 확인/취소 다이얼로그, boolean 값을 반환
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/shared/components/alert-dialog"

import { AlertTriangle, HelpCircle, Info } from "lucide-react"

import type { OverlayAsyncControllerProps } from "../types/overlay.types"

export interface SystemConfirmProps extends OverlayAsyncControllerProps<boolean> {
  /** 다이얼로그 제목 */
  title: string
  /** 다이얼로그 설명 */
  description: string
  /** 확인 버튼 텍스트 */
  confirmText?: string
  /** 취소 버튼 텍스트 */
  cancelText?: string
  /** 확인 버튼 variant */
  confirmVariant?: "default" | "destructive"
  /** 다이얼로그 타입 (아이콘 표시용) */
  variant?: "default" | "destructive" | "warning" | "info"
  /** 아이콘 표시 여부 */
  showIcon?: boolean
}

const confirmIcons = {
  default: HelpCircle,
  destructive: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
} as const

export const SystemConfirm = ({
  isOpen,
  close,
  overlayId,
  unmount,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "default",
  variant = "default",
  showIcon = true,
}: SystemConfirmProps) => {
  const Icon = confirmIcons[variant]

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 외부 클릭이나 ESC로 닫힌 경우 false 반환
      close(false)
      setTimeout(() => unmount(), 150)
    }
  }

  const handleConfirm = () => {
    close(true)
    setTimeout(() => unmount(), 150)
  }

  const handleCancel = () => {
    close(false)
    setTimeout(() => unmount(), 150)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {showIcon && <Icon className="h-5 w-5" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={
              confirmVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
            onClick={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
