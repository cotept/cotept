"use client"

/**
 * 타입 안전한 React Context 생성 유틸리티
 * overlay-kit에서 사용하는 안전한 Context 패턴
 */

import React, { createContext, useContext } from "react"

import type { OverlayData, SafeContextResult } from "../types/overlay.types"

/**
 * 타입 안전한 Context 생성기 (범용)
 * Provider 없이 사용할 때 명확한 에러 메시지 제공
 *
 * @template T - Context 데이터 타입
 * @returns ContextProvider와 useContextValue Hook
 */
function createGenericSafeContext<T>() {
  const Context = createContext<T | undefined>(undefined)

  const ContextProvider: React.FC<{ value: T; children: React.ReactNode }> = ({ value, children }) => {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  const useContextValue = (): T => {
    const context = useContext(Context)
    if (context === undefined) {
      throw new Error(
        "Context must be used within a corresponding Provider. " +
          "Make sure to wrap your component with the correct Provider.",
      )
    }
    return context
  }

  return { ContextProvider, useContextValue }
}

/**
 * Overlay 전용 SafeContext 생성기
 * OverlayData 타입에 특화된 버전
 */
export function createOverlaySafeContext(): SafeContextResult<OverlayData> {
  const { ContextProvider, useContextValue } = createGenericSafeContext<OverlayData>()

  return {
    OverlayContextProvider: ContextProvider,
    useCurrentOverlay: () => useContextValue().current,
    useOverlayData: () => useContextValue(),
  }
}
