"use client"

/**
 * Portal 기반 오버레이 렌더러
 * overlay-kit 상태와 Portal의 Z-index 관리를 결합한 하이브리드 구현
 */

import React, { useEffect, useSyncExternalStore } from "react"

import { createPortal } from "react-dom"

import { OVERLAY_ERROR_CODES, OverlayError } from "../types/overlay.types"

import { ContentOverlayController } from "./ContentOverlayController"

import type { OverlayRendererProps } from "../types/overlay.types"

/**
 * OverlayRenderer
 * 모든 활성 오버레이를 Portal을 통해 렌더링
 *
 * @description 하이브리드 접근법:
 * - overlay-kit: 상태 관리 (순서, 생명주기)
 * - Portal: DOM 분리, Z-index 자동 관리
 * - SSR 안전: useSyncExternalStore로 클라이언트 전용 DOM 접근 (Hydration mismatch 방지)
 *
 * @param overlayState - Reducer 상태
 * @param dispatch - Reducer 디스패치 함수
 */
export function OverlayRenderer({ overlayState, dispatch }: OverlayRendererProps) {
  // SSR 안전한 Portal 루트 요소 관리 (useSyncExternalStore 사용)
  const portalRoot = useSyncExternalStore(
    () => () => {}, // subscribe: static element이므로 구독 불필요
    () => document.getElementById("overlay-root"), // getSnapshot: client
    () => null, // getServerSnapshot: server
  )

  useEffect(() => {
    // 클라이언트 사이드에서만 체크
    if (typeof document !== "undefined" && !document.getElementById("overlay-root")) {
      console.error(
        new OverlayError(
          "#overlay-root element is required to render overlays.",
          OVERLAY_ERROR_CODES.PORTAL_ROOT_NOT_FOUND,
        ),
      )
    }
  }, [])

  // SSR 중이거나 portal root가 없으면 렌더링하지 않음
  if (!portalRoot) {
    return null
  }

  // 활성 오버레이가 없으면 렌더링하지 않음
  if (overlayState.overlayOrderList.length === 0) {
    return null
  }

  // Portal을 통해 overlay-root에 렌더링
  return createPortal(
    <>
      {overlayState.overlayOrderList.map((overlayId) => {
        const overlay = overlayState.overlayData?.[overlayId]

        // 방어 코드: 오버레이 데이터가 없거나 필수 프로퍼티가 없으면 스킵
        if (!overlay || !overlay.controller || !overlay.componentKey) {
          console.warn(`[Overlay Debug] OverlayRenderer: Skipping render for invalid overlay data for id: ${overlayId}`)
          return null
        }

        return (
          <ContentOverlayController
            key={overlay.componentKey}
            isOpen={overlay.isOpen}
            controller={overlay.controller}
            overlayId={overlayId}
            overlayDispatch={dispatch}
          />
        )
      })}
    </>,
    portalRoot,
  )
}
