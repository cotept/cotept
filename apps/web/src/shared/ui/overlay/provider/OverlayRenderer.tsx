/**
 * Portal 기반 오버레이 렌더러
 * overlay-kit 상태와 Portal의 Z-index 관리를 결합한 하이브리드 구현
 */

import React from "react"

import { createPortal } from "react-dom"

import { ContentOverlayController } from "./ContentOverlayController"

import type { OverlayRendererProps } from "../types/overlay.types"

/**
 * OverlayRenderer
 * 모든 활성 오버레이를 Portal을 통해 렌더링
 *
 * @description 하이브리드 접근법:
 * - overlay-kit: 상태 관리 (순서, 생명주기)
 * - Portal: DOM 분리, Z-index 자동 관리
 *
 * @param overlayState - Reducer 상태
 * @param dispatch - Reducer 디스패치 함수
 */
export function OverlayRenderer({ overlayState, dispatch }: OverlayRendererProps) {
  // Portal 루트 요소 확인
  const portalRoot = document.getElementById("overlay-root")

  if (!portalRoot) {
    console.warn(
      "[Overlay] Portal root element not found. " + 'Make sure to add <div id="overlay-root"></div> to your HTML.',
    )
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
        const overlay = overlayState.overlayData[overlayId]

        // 오버레이 데이터가 없으면 스킵
        if (!overlay) {
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
