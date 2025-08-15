/**
 * SystemAlert - Overlay 시스템용 Alert 컴포넌트
 *
 * shadcn/ui Alert를 overlay-kit 호환 인터페이스로 래핑
 * 정적 알림 메시지 표시용
 */

import { useEffect } from "react"

import { Alert, AlertDescription, AlertTitle } from "@repo/shared/components/alert"

import { CheckCircle, Info, XCircle } from "lucide-react"

import type { OverlayControllerProps } from "../types/overlay.types"

export interface SystemAlertProps extends OverlayControllerProps {
  /** 알림 제목 */
  title?: string
  /** 알림 내용 */
  description: string
  /** 알림 타입 */
  variant?: "default" | "destructive" | "success" | "info"
  /** 자동 닫기 시간(ms), 0이면 수동 닫기 */
  autoClose?: number
  /** 아이콘 표시 여부 */
  showIcon?: boolean
  /** 커스텀 CSS 클래스 */
  className?: string
}

const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  info: Info,
} as const

export const SystemAlert = ({
  isOpen,
  close,
  overlayId,
  unmount,
  title,
  description,
  variant = "default",
  autoClose = 0,
  showIcon = true,
  className = "",
}: SystemAlertProps) => {
  const Icon = alertIcons[variant]

  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(() => {
        close()
        setTimeout(() => unmount(), 150) // 애니메이션 완료 후 언마운트
      }, autoClose)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, close, unmount])

  if (!isOpen) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert
        variant={variant === "success" || variant === "info" ? "default" : variant}
        className={`${className} ${variant === "success" ? "border-green-500 text-green-700 dark:text-green-400" : ""} ${variant === "info" ? "border-blue-500 text-blue-700 dark:text-blue-400" : ""}`}>
        {showIcon && <Icon className="h-4 w-4" />}
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  )
}
