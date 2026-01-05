"use client"
import React from "react"

import { deepMerge } from "@repo/shared/lib/utils"
import { DeepPartial } from "@repo/shared/types/types"

import { SystemAlert, type SystemAlertProps } from "@/shared/ui/overlay/components/SystemAlert"
import { SystemConfirm, type SystemConfirmProps } from "@/shared/ui/overlay/components/SystemConfirm"
import { overlay } from "@/shared/ui/overlay/createOverlayContext"
import { OpenOverlayAsyncOptions, OverlayAsyncControllerProps } from "@/shared/ui/overlay/types/overlay.types"

/**
 * @file Promise 기반 오버레이를 생성하고 관리하기 위한 훅과 유틸리티를 제공합니다.
 * - `useOverlay`: overlay-kit 스타일의 React 훅
 * - `openOverlay`: 함수형 오버레이 열기 (훅 규칙 불필요)
 * - `createOverlayHelper`: 오버레이를 선언적 함수로 변환하는 팩토리
 * - `overlayPresets`: 자주 사용되는 오버레이 프리셋
 */

// ============================================================================
// Core Functions
// ============================================================================

/**
 * 오버레이 컴포넌트를 Promise 기반으로 열기 위한 헬퍼 함수
 * 컴포넌트 외부에서도 호출 가능하며, 훅 규칙에 제약받지 않습니다.
 *
 * @example
 * import { openOverlay } from "@/shared/hooks/useOverlay"
 * import { SystemConfirm } from "@/shared/ui/overlay/components/SystemConfirm"
 *
 * const confirmed = await openOverlay(SystemConfirm, {
 *   title: "확인",
 *   description: "진행하시겠습니까?"
 * })
 */
export function openOverlay<TResult = boolean, TProps = Record<string, unknown>>(
  Component: React.ComponentType<OverlayAsyncControllerProps<TResult> & TProps>,
  props: TProps,
  options?: OpenOverlayAsyncOptions<TResult>,
): Promise<TResult> {
  return overlay.openAsync<TResult>((controllerProps) => <Component {...controllerProps} {...props} />, options)
}

/**
 * 오버레이 컴포넌트를 선언적으로 사용할 수 있는 함수로 변환하는 팩토리
 *
 * @example
 * const confirmDelete = createOverlayHelper(SystemConfirm)
 * const confirmed = await confirmDelete({
 *   title: "삭제",
 *   description: "정말 삭제하시겠습니까?",
 *   confirmVariant: "destructive"
 * })
 */
export function createOverlayHelper<TProps, TResult = boolean>(
  Component: React.ComponentType<OverlayAsyncControllerProps<TResult> & TProps>,
) {
  return (props: TProps, options?: OpenOverlayAsyncOptions<TResult>): Promise<TResult> =>
    openOverlay<TResult, TProps>(Component, props, options)
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * overlay-kit 스타일의 React 훅
 * Provider 내부에서 overlay API와 선언형 helper를 모두 제공합니다.
 */
export function useOverlay() {
  return {
    ...overlay,
    /**
     * JSX 없이 선언적으로 오버레이를 여는 helper
     * (기존 useOverlay().open 시그니처와 호환)
     */
    openDeclarative: openOverlay,
  }
}

// ============================================================================
// Presets
// ============================================================================

// Public Props 타입 정의 (OverlayAsyncControllerProps 제외)
type PublicConfirmProps = Omit<SystemConfirmProps, keyof OverlayAsyncControllerProps<boolean>>
type PublicAlertProps = Omit<SystemAlertProps, keyof OverlayAsyncControllerProps<void>>

// 프리셋용 헬퍼 함수
const confirm = createOverlayHelper<PublicConfirmProps>(SystemConfirm)
const alert = createOverlayHelper<PublicAlertProps, void>(SystemAlert)

/**
 * 자주 사용되는 오버레이를 미리 정의한 프리셋 객체
 * 기본 설정을 제공하며, overrides로 커스터마이징 가능합니다.
 *
 * @example
 * import { overlayPresets } from "@/shared/hooks/useOverlay"
 *
 * // 기본 사용
 * const confirmed = await overlayPresets.confirmDelete("세션")
 *
 * // 커스터마이징
 * const confirmed = await overlayPresets.confirmDelete("세션", {
 *   title: "정말로 삭제할까요?",
 *   confirmText: "삭제"
 * })
 */
export const overlayPresets = {
  /**
   * 페이지 이탈 여부를 묻는 확인창
   */
  confirmLeave: (overrides?: DeepPartial<PublicConfirmProps>) => {
    const defaultProps: PublicConfirmProps = {
      title: "페이지 이탈",
      description: "변경사항이 저장되지 않았습니다. 정말로 페이지를 떠나시겠습니까?",
      confirmVariant: "destructive",
    }
    return confirm(deepMerge(defaultProps, overrides ?? {}))
  },

  /**
   * 항목 삭제 여부를 묻는 확인창
   */
  confirmDelete: (itemName: string, overrides?: DeepPartial<PublicConfirmProps>) => {
    const defaultProps: PublicConfirmProps = {
      title: "항목 삭제",
      description: `"${itemName}"을(를) 삭제하시겠습니까?`,
      confirmVariant: "destructive",
    }
    return confirm(deepMerge(defaultProps, overrides ?? {}))
  },

  /**
   * 로그아웃 여부를 묻는 확인창
   */
  confirmLogout: (overrides?: DeepPartial<PublicConfirmProps>) => {
    const defaultProps: PublicConfirmProps = {
      title: "로그아웃",
      description: "정말 로그아웃하시겠습니까?",
    }
    return confirm(deepMerge(defaultProps, overrides ?? {}))
  },

  /**
   * 성공 메시지 알림창
   */
  showSuccess: (message: string, overrides?: DeepPartial<PublicAlertProps>) => {
    const defaultProps: PublicAlertProps = {
      variant: "success",
      description: message,
      autoClose: 3000,
    }
    const finalProps = deepMerge(defaultProps, overrides ?? {})
    if (overrides?.description == null) {
      finalProps.description = message
    }
    return alert(finalProps)
  },
}
