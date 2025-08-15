/**
 * SystemSheet - Overlay 시스템용 Sheet 컴포넌트
 *
 * shadcn/ui Sheet를 overlay-kit 호환 인터페이스로 래핑
 * 사이드 패널, 드로어 등으로 사용
 */

import { ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/shared/components/sheet"

import type { OverlayControllerProps } from "../types/overlay.types"

export interface SystemSheetProps extends OverlayControllerProps {
  /** Sheet 제목 */
  title?: string
  /** Sheet 설명 */
  description?: string
  /** Sheet 내용 */
  children: ReactNode
  /** Sheet 위치 */
  side?: "top" | "right" | "bottom" | "left"
  /** 커스텀 CSS 클래스 */
  className?: string
  /** Footer 영역 내용 */
  footer?: ReactNode
  /** Header 숨기기 여부 */
  hideHeader?: boolean
}

export const SystemSheet = ({
  isOpen,
  close,
  overlayId,
  unmount,
  title,
  description,
  children,
  side = "right",
  className = "",
  footer,
  hideHeader = false,
}: SystemSheetProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close()
      // 애니메이션 완료 후 언마운트 (Sheet은 애니메이션 시간이 좀 더 김)
      setTimeout(() => unmount(), 300)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side={side} className={className}>
        {!hideHeader && (title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}

        <div className="grid flex-1 auto-rows-min gap-6 px-4">{children}</div>

        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
