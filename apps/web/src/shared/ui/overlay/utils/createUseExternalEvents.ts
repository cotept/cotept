"use client"

/**
 * External Events 시스템 핵심 구현
 * overlay-kit의 컴포넌트 외부 제어를 위한 Hook 및 Event 생성기
 */

import { useEffect } from "react"

import { createEmitter } from "./emitter"

import type { CreateEventFunction, EventEmitter, UseExternalEvents } from "../types/overlay.types"

/**
 * External Events 시스템을 위한 Hook과 Event 생성기 Factory
 *
 * @template T - 이벤트 타입 맵
 * @param namespace - 이벤트 네임스페이스 (충돌 방지)
 * @returns [useExternalEvents, createEvent] 튜플
 *
 * @example
 * ```typescript
 * const [useOverlayEvent, createEvent] = createUseExternalEvents<OverlayEvent>('overlay-system');
 *
 * // Provider에서 사용
 * useOverlayEvent({
 *   open: (data) => console.log('overlay opened', data),
 *   close: (id) => console.log('overlay closed', id)
 * });
 *
 * // 외부에서 사용
 * const openEvent = createEvent('open');
 * openEvent({ controller: MyComponent, overlayId: 'test', componentKey: 'key1' });
 * ```
 */
export function createUseExternalEvents<T extends Record<string, (...args: any[]) => void>>(
  namespace: string,
): [UseExternalEvents<T>, <K extends keyof T>(eventName: K) => CreateEventFunction<T, K>] {
  // namespace별로 emitter 인스턴스 생성
  const emitterInstance: EventEmitter<T> = getEmitterInstance<T>(namespace)

  /**
   * React Hook: 컴포넌트 내에서 외부 이벤트 수신
   *
   * @param events - 이벤트 핸들러 객체
   */
  const useExternalEvents: UseExternalEvents<T> = (events: T) => {
    useEffect(() => {
      // 모든 이벤트 리스너 등록
      Object.entries(events).forEach(([eventName, handler]) => {
        emitterInstance.on(eventName as keyof T, handler as T[keyof T])
      })

      // 컴포넌트 언마운트 시 이벤트 리스너 해제
      return () => {
        Object.entries(events).forEach(([eventName, handler]) => {
          emitterInstance.off(eventName as keyof T, handler as T[keyof T])
        })
      }
    }, [events])
  }

  /**
   * Event 생성기: 컴포넌트 외부에서 이벤트 발송
   *
   * @param eventName - 발송할 이벤트명
   * @returns 이벤트 발송 함수
   */
  const createEvent = <K extends keyof T>(eventName: K): CreateEventFunction<T, K> => {
    return (...args: Parameters<T[K]>) => {
      emitterInstance.emit(eventName, ...args)
    }
  }

  return [useExternalEvents, createEvent]
}

/**
 * Global Events Map (네임스페이스별 emitter 관리)
 * 메모리 누수 방지를 위한 중앙 관리
 */
const globalEmitters = new Map<string, EventEmitter<any>>()

/**
 * 네임스페이스별 Emitter 인스턴스 관리
 * 동일한 네임스페이스에 대해 같은 인스턴스 반환
 */
export function getEmitterInstance<T extends Record<string, (...args: any[]) => void>>(
  namespace: string,
): EventEmitter<T> {
  if (!globalEmitters.has(namespace)) {
    globalEmitters.set(namespace, createEmitter<T>(namespace))
  }
  return globalEmitters.get(namespace)!
}

/**
 * 네임스페이스 정리 (메모리 누수 방지)
 */
export function cleanupEmitter(namespace: string): void {
  const emitter = globalEmitters.get(namespace)
  if (emitter) {
    emitter.removeAllListeners()
    globalEmitters.delete(namespace)
  }
}

/**
 * 모든 Emitter 정리 (앱 종료 시)
 */
export function cleanupAllEmitters(): void {
  globalEmitters.forEach((emitter, namespace) => {
    emitter.removeAllListeners()
  })
  globalEmitters.clear()
}
