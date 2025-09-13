"use client"

/**
 * Overlay Provider Factory 함수
 * overlay-kit 방식의 Provider 생성과 Portal 렌더링을 결합한 하이브리드 구현
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react"

import { overlayReducer } from "../context/reducer"
import { createOverlay } from "../event/event"
import { createOverlaySafeContext } from "../utils/createSafeContext"
import { createUseExternalEvents } from "../utils/createUseExternalEvents"
import { randomId } from "../utils/randomId"

import { OverlayRenderer } from "./OverlayRenderer"

import type { OverlayEvent, OverlayProviderResult } from "../types/overlay.types"

// HMR (Hot Module Replacement) 환경에서 싱글턴 인스턴스를 유지하기 위한 전역 캐시
const DEV_GLOBAL_KEY = "__cotept_overlay_provider__"

interface GlobalWithOverlay {
  [DEV_GLOBAL_KEY]?: OverlayProviderResult
}

function getDevSafeInstance(): OverlayProviderResult | undefined {
  if (process.env.NODE_ENV === "development") {
    return (global as GlobalWithOverlay)[DEV_GLOBAL_KEY]
  }
  return undefined
}

function setDevSafeInstance(instance: OverlayProviderResult) {
  if (process.env.NODE_ENV === "development") {
    ;(global as GlobalWithOverlay)[DEV_GLOBAL_KEY] = instance
  }
}

/**
 * createOverlayProvider
 * overlay-kit의 Factory 패턴을 구현하여 독립적인 overlay 인스턴스 생성
 *
 * @returns OverlayProviderResult - overlay API, Provider, hooks
 *
 * @example
 * ```typescript
 * const { overlay, OverlayProvider } = createOverlayProvider();
 *
 * // App.tsx
 * <OverlayProvider>
 *   <App />
 * </OverlayProvider>
 *
 * // Component.tsx
 * const result = await overlay.openAsync(MyModal);
 * ```
 */
export function createOverlayProvider(): OverlayProviderResult {
  const existingInstance = getDevSafeInstance()
  if (existingInstance) {
    return existingInstance
  }

  // 고유한 overlay 인스턴스 ID 생성
  const overlayId = randomId()

  // External Events API와 Context 생성
  const overlayAPI = createOverlay(overlayId)

  // 내부적으로만 사용할 useOverlayEvent 추출
  const [useOverlayEvent] = createUseExternalEvents<OverlayEvent>(`${overlayId}/overlay-kit`)
  const { OverlayContextProvider, useCurrentOverlay, useOverlayData } = createOverlaySafeContext()

  /**
   * OverlayProvider 컴포넌트
   * overlay-kit의 상태 관리와 Portal 렌더링을 통합
   */
  function OverlayProvider({ children }: { children: React.ReactNode }) {
    // Reducer 기반 상태 관리
    const [overlayState, overlayDispatch] = useReducer(overlayReducer, {
      current: null,
      overlayOrderList: [],
      overlayData: {},
    })

    // 이전 상태 참조 (overlay-kit 구현 방식)
    const prevOverlayState = useRef(overlayState)

    // External Events 핸들러들
    const open: OverlayEvent["open"] = useCallback(({ controller, overlayId, componentKey }) => {
      overlayDispatch({
        type: "ADD",
        overlay: {
          id: overlayId,
          componentKey,
          isOpen: false,
          isMounted: false,
          controller: controller,
        },
      })
    }, [])

    const close: OverlayEvent["close"] = useCallback((overlayId: string) => {
      overlayDispatch({ type: "CLOSE", overlayId })
    }, [])

    const unmount: OverlayEvent["unmount"] = useCallback((overlayId: string) => {
      overlayDispatch({ type: "REMOVE", overlayId })
    }, [])

    const closeAll: OverlayEvent["closeAll"] = useCallback(() => {
      overlayDispatch({ type: "CLOSE_ALL" })
    }, [])

    const unmountAll: OverlayEvent["unmountAll"] = useCallback(() => {
      overlayDispatch({ type: "REMOVE_ALL" })
    }, [])

    const events = useMemo(
      () => ({ open, close, unmount, closeAll, unmountAll }),
      [close, closeAll, open, unmount, unmountAll],
    )

    // External Events 리스너 등록
    useOverlayEvent(events)

    // External Events 리스너 등록
    // useOverlayEvent({ open, close, unmount, closeAll, unmountAll })

    // overlay-kit의 재개방 로직 구현 (SSR 안전 버전)
    if (prevOverlayState.current !== overlayState) {
      overlayState.overlayOrderList.forEach((overlayId) => {
        // 방어 코드: prevOverlayState.current가 null이거나 overlayData가 없을 수 있음
        const prevOverlayData = prevOverlayState.current?.overlayData
        const currOverlayData = overlayState.overlayData

        // 방어 코드: 모든 체이닝에서 undefined 가능성 체크
        if (
          prevOverlayData?.[overlayId] != null &&
          prevOverlayData[overlayId]?.isMounted === true &&
          currOverlayData?.[overlayId] != null
        ) {
          const isPrevOverlayClosed = prevOverlayData[overlayId]?.isOpen === false
          const isCurrOverlayOpened = currOverlayData[overlayId]?.isOpen === true

          // 닫혀있던 오버레이가 다시 열렸을 때
          if (isPrevOverlayClosed && isCurrOverlayOpened) {
            requestAnimationFrame(() => {
              overlayDispatch({ type: "OPEN", overlayId })
            })
          }
        }
      })

      prevOverlayState.current = overlayState
    }

    // 컴포넌트 언마운트 시 모든 오버레이 정리
    useEffect(() => {
      return () => {
        overlayDispatch({ type: "REMOVE_ALL" })
      }
    }, [])

    return (
      <OverlayContextProvider value={overlayState}>
        {children}

        {/* 하이브리드 핵심: Portal을 통한 렌더링 */}
        <OverlayRenderer overlayState={overlayState} dispatch={overlayDispatch} />
      </OverlayContextProvider>
    )
  }

  const instance: OverlayProviderResult = {
    overlay: overlayAPI,
    OverlayProvider,
    useCurrentOverlay,
    useOverlayData,
  }

  setDevSafeInstance(instance)

  return instance
}
