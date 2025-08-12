/**
 * External Events 시스템용 Event Emitter (eventemitter3 기반)
 * overlay-kit의 컴포넌트 외부 제어를 위한 이벤트 시스템
 */

import { EventEmitter as BaseEventEmitter } from "eventemitter3"

import type { EventEmitter } from "../types/overlay.types"

/**
 * eventemitter3 기반 타입 안전한 Event Emitter 구현
 *
 * @param namespace - 디버깅용 네임스페이스
 * @returns 타입 안전한 EventEmitter 인스턴스
 */
export function createEmitter<T extends Record<string, (...args: any[]) => void>>(namespace: string): EventEmitter<T> {
  const emitter = new BaseEventEmitter()

  return {
    /**
     * 이벤트 리스너 등록
     */
    on<K extends keyof T>(eventName: K, handler: T[K]): void {
      emitter.on(eventName as string, handler)
    },

    /**
     * 이벤트 리스너 해제
     */
    off<K extends keyof T>(eventName: K, handler: T[K]): void {
      emitter.off(eventName as string, handler)
    },

    /**
     * 이벤트 발송 (에러 핸들링 포함)
     */
    emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void {
      try {
        emitter.emit(eventName as string, ...args)
      } catch (error) {
        console.error(`[Overlay Event Error] ${namespace}:${String(eventName)}`, error)
      }
    },

    /**
     * 모든 리스너 제거 (메모리 누수 방지)
     */
    removeAllListeners(): void {
      emitter.removeAllListeners()
    },
  }
}
