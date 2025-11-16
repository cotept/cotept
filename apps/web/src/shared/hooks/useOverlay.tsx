import React from "react"

import { deepMerge } from "@repo/shared/lib/utils"
import { DeepPartial } from "@repo/shared/types/types"

import { SystemAlert, type SystemAlertProps } from "@/shared/ui/overlay/components/SystemAlert"
import { SystemConfirm, type SystemConfirmProps } from "@/shared/ui/overlay/components/SystemConfirm"
import { overlay } from "@/shared/ui/overlay/createOverlayContext"
import { OverlayAsyncControllerProps } from "@/shared/ui/overlay/types/overlay.types"

/**
 * @file Promise 기반 오버레이를 생성하고 관리하기 위한 훅과 프리셋을 제공합니다.
 * - `createOverlayHelper`: 오버레이 컴포넌트를 Promise API로 변환하는 팩토리 함수입니다.
 * - `overlayPresets`: 자주 사용되는 오버레이(confirm, alert 등)를 미리 정의한 객체입니다.
 */

/**
 * 오버레이 컴포넌트를 Promise 기반의 비동기 함수로 변환하는 팩토리 함수입니다.
 * 이 함수를 사용하면 `await` 키워드로 오버레이의 결과를 기다릴 수 있어,
 * 선언적이고 직관적인 방식으로 오버레이 로직을 작성할 수 있습니다.
 *
 * @template TProps - 오버레이 컴포넌트가 받을 public props 타입
 * @template TResult - 오버레이가 닫힐 때 반환할 값의 타입 (기본값: boolean)
 * @param Component - 오버레이로 렌더링할 리액트 컴포넌트. `OverlayAsyncControllerProps`를 props로 받아야 합니다.
 * @returns 컴포넌트의 `TProps`를 인자로 받아 `Promise<TResult>`를 반환하는 함수
 *
 * @example
 * const confirm = createOverlayHelper(SystemConfirm);
 * const isConfirmed = await confirm({ title: '확인', description: '진행하시겠습니까?' });
 * if (isConfirmed) { ... }
 */
export function createOverlayHelper<TProps, TResult = boolean>(
  Component: React.ComponentType<OverlayAsyncControllerProps<TResult> & TProps>,
) {
  return (props: TProps): Promise<TResult> => {
    return overlay.openAsync<TResult>((controllerProps) => <Component {...controllerProps} {...props} />)
  }
}

// 오버레이 시스템이 내부적으로 주입하는 `OverlayAsyncControllerProps`를 제외하여,
// 개발자가 직접 전달해야 하는 순수한 Public Props 타입을 정의합니다.
// 이를 통해 타입 안정성을 높이고 API의 의도를 명확하게 합니다.
type PublicConfirmProps = Omit<SystemConfirmProps, keyof OverlayAsyncControllerProps<boolean>>
type PublicAlertProps = Omit<SystemAlertProps, keyof OverlayAsyncControllerProps<void>>

// Public Props 타입을 사용하여 각 컴포넌트에 대한 헬퍼를 미리 생성합니다.
const confirm = createOverlayHelper<PublicConfirmProps>(SystemConfirm)
const alert = createOverlayHelper<PublicAlertProps, void>(SystemAlert)

/**
 * 자주 사용되는 오버레이를 미리 정의한 프리셋 객체입니다.
 * 각 프리셋은 `overrides` 인자를 통해 기본 props를 유연하게 재정의할 수 있습니다.
 *
 * @example
 * // 기본 사용
 * const confirmed = await overlayPresets.confirmDelete("세션");
 *
 * // title을 재정의하여 사용
 * const confirmedWithCustomTitle = await overlayPresets.confirmDelete("세션", { title: "정말로 삭제할까요?" });
 */
export const overlayPresets = {
  /**
   * 페이지 이탈 여부를 묻는 확인창을 엽니다.
   * @param overrides - 기본 props를 재정의하기 위한 객체
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
   * 특정 항목의 삭제 여부를 묻는 확인창을 엽니다.
   * @param itemName - 삭제할 항목의 이름
   * @param overrides - 기본 props를 재정의하기 위한 객체
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
   * 로그아웃 여부를 묻는 확인창을 엽니다.
   * @param overrides - 기본 props를 재정의하기 위한 객체
   */
  confirmLogout: (overrides?: DeepPartial<PublicConfirmProps>) => {
    const defaultProps: PublicConfirmProps = {
      title: "로그아웃",
      description: "정말 로그아웃하시겠습니까?",
    }
    return confirm(deepMerge(defaultProps, overrides ?? {}))
  },

  /**
   * 성공 메시지를 표시하는 알림창을 엽니다.
   * @param message - 표시할 성공 메시지
   * @param overrides - 기본 props를 재정의하기 위한 객체
   */
  showSuccess: (message: string, overrides?: DeepPartial<PublicAlertProps>) => {
    const defaultProps: PublicAlertProps = {
      variant: "success",
      description: message,
      autoClose: 3000,
    }
    // `description`은 항상 `message` 인자로 제어되도록 보장합니다.
    const finalProps = deepMerge(defaultProps, overrides ?? {})
    finalProps.description = message
    return alert(finalProps)
  },
}
