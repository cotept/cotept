/**
 * SystemPopover - 재사용 가능한 Popover 컴포넌트
 * 
 * shadcn/ui Popover를 trigger prop 방식으로 래핑
 * 일반적인 컴포넌트 합성 패턴으로 사용
 */

import { ReactNode } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@repo/shared/components/popover"

export interface SystemPopoverProps {
  /** 트리거 요소 */
  trigger: ReactNode
  /** 팝오버 내용 */
  children: ReactNode
  /** 정렬 방향 */
  align?: "start" | "center" | "end"
  /** 표시 위치 */
  side?: "top" | "right" | "bottom" | "left"
  /** 앵커로부터의 거리 */
  sideOffset?: number
  /** 커스텀 CSS 클래스 */
  className?: string
  /** 열림/닫힘 상태 제어 (선택적) */
  open?: boolean
  /** 상태 변경 핸들러 (선택적) */
  onOpenChange?: (open: boolean) => void
}

export const SystemPopover = ({
  trigger,
  children,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  className = "",
  open,
  onOpenChange,
}: SystemPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={className}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}