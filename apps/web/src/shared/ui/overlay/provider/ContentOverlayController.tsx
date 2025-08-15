"use client"

/**
 * 개별 오버레이 Controller 컴포넌트
 * overlay-kit의 생명주기 관리와 Portal 통합
 */

import React, { memo, useEffect } from "react"

import type { ContentOverlayControllerProps } from "../types/overlay.types"

/**
 * ContentOverlayController
 * 개별 오버레이의 생명주기를 관리하고 Controller 컴포넌트를 렌더링
 *
 * @description overlay-kit의 정확한 생명주기 구현:
 * 1. 컴포넌트 마운트 시 requestAnimationFrame으로 OPEN 액션 디스패치
 * 2. Controller 컴포넌트에 close/unmount 함수 전달
 * 3. memo로 불필요한 리렌더링 방지
 */
export const ContentOverlayController = memo<ContentOverlayControllerProps>(
  ({ isOpen, overlayId, overlayDispatch, controller: Controller }) => {
    // 컴포넌트 마운트 시 오버레이 OPEN 상태로 변경
    useEffect(() => {
      // SSR 안전성: requestAnimationFrame은 브라우저 환경에서만 사용 가능
      if (typeof window !== "undefined") {
        // requestAnimationFrame을 사용하여 다음 프레임에서 실행
        // 이는 overlay-kit의 정확한 구현 방식
        requestAnimationFrame(() => {
          overlayDispatch({ type: "OPEN", overlayId })
        })
      }
    }, [overlayDispatch, overlayId])

    // Controller 컴포넌트 렌더링
    return (
      <Controller
        isOpen={isOpen}
        overlayId={overlayId}
        close={() => overlayDispatch({ type: "CLOSE", overlayId })}
        unmount={() => overlayDispatch({ type: "REMOVE", overlayId })}
      />
    )
  },
)

ContentOverlayController.displayName = "ContentOverlayController"
