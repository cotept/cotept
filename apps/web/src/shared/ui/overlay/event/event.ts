/**
 * overlay.open, overlay.openAsync 메인 API 구현
 * overlay-kit의 External Events 패턴 구현
 */

import React from "react"

import { createUseExternalEvents } from "../utils/createUseExternalEvents"
import { randomId } from "../utils/randomId"

import type {
  OpenOverlayOptions,
  OverlayAPI,
  OverlayAsyncControllerComponent,
  OverlayAsyncControllerProps,
  OverlayControllerComponent,
  OverlayEvent,
} from "../types/overlay.types"

/**
 * Overlay 인스턴스 생성 Factory
 * 각 overlay 인스턴스는 독립적인 이벤트 시스템을 가짐
 *
 * @param overlayId - overlay 인스턴스 식별자
 * @returns OverlayAPI 객체
 *
 * @example
 * ```typescript
 * const overlay = createOverlay('main-overlay');
 *
 * // 일반 사용
 * const id = overlay.open(({ isOpen, close }) => (
 *   <Dialog open={isOpen} onClose={close}>
 *     <p>Hello World</p>
 *   </Dialog>
 * ));
 *
 * // 비동기 사용
 * try {
 *   const result = await overlay.openAsync<string>(({ isOpen, close }) => (
 *     <Dialog open={isOpen}>
 *       <Button onClick={() => close('confirmed')}>확인</Button>
 *     </Dialog>
 *   ));
 * } catch (e) {
 *   console.log('Dismissed');
 * }
 * ```
 */
export function createOverlay(overlayId: string): OverlayAPI {
  console.log(`[Overlay Debug] createOverlay called for instance: ${overlayId}`)
  // External Events 시스템 초기화
  const [useOverlayEvent, createEvent] = createUseExternalEvents<OverlayEvent>(`${overlayId}/overlay-kit`)

  /**
   * 오버레이 열기 (동기)
   */
  const open = (controller: OverlayControllerComponent, options?: OpenOverlayOptions): string => {
    const targetOverlayId = options?.overlayId ?? randomId()
    console.log(`[Overlay Debug] open: Firing 'open' event for overlayId: ${targetOverlayId}`)
    const componentKey = randomId()
    const dispatchOpenEvent = createEvent("open")

    // External Events로 오버레이 추가 요청
    dispatchOpenEvent({
      controller,
      overlayId: targetOverlayId,
      componentKey,
    })

    return targetOverlayId
  }

  /**
   * 오버레이 열기 (비동기)
   * Promise 기반으로 결과값을 기다림
   */
  const openAsync = async <T>(
    controller: OverlayAsyncControllerComponent<T>,
    options?: OpenOverlayOptions,
  ): Promise<T> => {
    console.log(`[Overlay Debug] openAsync: Creating promise-wrapped overlay.`)
    return new Promise<T>((resolve, reject) => {
      let isSettled = false

      // 비동기 Controller를 일반 Controller로 래핑
      const WrappedController: OverlayControllerComponent = (overlayProps) => {
        // 오버레이가 unmount될 때 Promise가 완료되지 않았으면 reject 처리
        React.useEffect(
          () => () => {
            if (!isSettled) {
              isSettled = true
              console.log(
                `[Overlay Debug] openAsync: Promise rejected due to dismissal for overlayId: ${overlayProps.overlayId}`,
              )
              reject(new Error("Overlay was dismissed."))
            }
          },
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [],
        )

        /**
         * 결과값과 함께 오버레이 닫기
         */
        const close = ((...args: any[]) => {
          if (!isSettled) {
            isSettled = true
            console.log(`[Overlay Debug] openAsync: Promise resolved for overlayId: ${overlayProps.overlayId}`)
            resolve(args[0] as T)
            overlayProps.close()
          }
        }) as OverlayAsyncControllerProps<T>["close"]

        // 오버라이드된 props 전달
        const asyncProps: OverlayAsyncControllerProps<T> = { ...overlayProps, close }
        return controller(asyncProps)
      }

      // 래핑된 Controller로 오버레이 열기
      open(WrappedController, options)
    })
  }

  /**
   * 오버레이 닫기
   */
  const close = createEvent("close")

  /**
   * 오버레이 언마운트 (DOM에서 완전 제거)
   */
  const unmount = createEvent("unmount")

  /**
   * 모든 오버레이 닫기
   */
  const closeAll = createEvent("closeAll")

  /**
   * 모든 오버레이 언마운트
   */
  const unmountAll = createEvent("unmountAll")

  return {
    open,
    openAsync,
    close,
    unmount,
    closeAll,
    unmountAll,
  }
}
