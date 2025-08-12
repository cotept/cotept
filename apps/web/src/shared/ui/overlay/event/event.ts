/**
 * overlay.open, overlay.openAsync 메인 API 구현
 * overlay-kit의 External Events 패턴 구현
 */

import { createUseExternalEvents } from "../utils/createUseExternalEvents"
import { randomId } from "../utils/randomId"

import type {
  OpenOverlayOptions,
  OverlayAPI,
  OverlayAsyncControllerComponent,
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
 * const result = await overlay.openAsync<string>(({ isOpen, close }) => (
 *   <Dialog open={isOpen}>
 *     <Button onClick={() => close('confirmed')}>확인</Button>
 *   </Dialog>
 * ));
 * ```
 */
export function createOverlay(overlayId: string): OverlayAPI {
  // External Events 시스템 초기화
  const [useOverlayEvent, createEvent] = createUseExternalEvents<OverlayEvent>(`${overlayId}/overlay-kit`)

  /**
   * 오버레이 열기 (동기)
   */
  const open = (controller: OverlayControllerComponent, options?: OpenOverlayOptions): string => {
    const targetOverlayId = options?.overlayId ?? randomId()
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
    return new Promise<T>((resolve) => {
      // 비동기 Controller를 일반 Controller로 래핑
      const wrappedController: OverlayControllerComponent = (overlayProps) => {
        /**
         * 결과값과 함께 오버레이 닫기
         */
        const close = (param: T) => {
          resolve(param)
          overlayProps.close()
        }

        // 오버라이드된 props 전달
        const asyncProps = { ...overlayProps, close }
        return controller(asyncProps)
      }

      // 래핑된 Controller로 오버레이 열기
      open(wrappedController, options)
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
