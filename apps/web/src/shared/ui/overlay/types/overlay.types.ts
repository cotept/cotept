/**
 * CotePT Overlay System 핵심 타입 정의
 * 
 * toss/overlay-kit 호환 API를 제공하는 TypeScript 타입 정의
 * Factory + External Events + Reducer + Portal 하이브리드 아키텍처 지원
 */

import type { FC } from 'react';

/**
 * overlay-kit Controller Props (일반)
 * 컴포넌트 외부에서 오버레이를 제어할 수 있는 props
 */
export interface OverlayControllerProps {
  /** 고유 식별자 */
  overlayId: string;
  /** 열림/닫힘 상태 */
  isOpen: boolean;
  /** 오버레이 닫기 */
  close: () => void;
  /** 오버레이 언마운트 (DOM에서 완전 제거) */
  unmount: () => void;
}

/**
 * overlay-kit Controller Props (비동기)
 * openAsync와 함께 사용되며 결과값을 전달할 수 있음
 */
export interface OverlayAsyncControllerProps<T> extends Omit<OverlayControllerProps, 'close'> {
  /** 결과값과 함께 오버레이 닫기 */
  close: (param: T) => void;
}

/**
 * overlay-kit 일반 Controller 컴포넌트 타입
 */
export type OverlayControllerComponent = FC<OverlayControllerProps>;

/**
 * overlay-kit 비동기 Controller 컴포넌트 타입
 */
export type OverlayAsyncControllerComponent<T> = FC<OverlayAsyncControllerProps<T>>;

/**
 * overlay-kit Reducer에서 관리하는 오버레이 아이템
 */
export interface OverlayItem {
  /** 오버레이 고유 식별자 */
  id: string;
  /** 컴포넌트 고유 키 (언마운트 시 식별용) */
  componentKey: string;
  /** 열림 상태 */
  isOpen: boolean;
  /** 마운트 상태 */
  isMounted: boolean;
  /** 렌더링할 Controller 컴포넌트 */
  controller: OverlayControllerComponent;
}

/**
 * overlay-kit Reducer 전체 상태
 */
export interface OverlayData {
  /** 현재 활성 오버레이 ID */
  current: string | null;
  /** 오버레이 순서 리스트 */
  overlayOrderList: string[];
  /** 오버레이 데이터 맵 */
  overlayData: Record<string, OverlayItem>;
}

/**
 * overlay-kit Reducer 액션 타입
 */
export type OverlayReducerAction =
  | { type: 'ADD'; overlay: OverlayItem }
  | { type: 'OPEN'; overlayId: string }
  | { type: 'CLOSE'; overlayId: string }
  | { type: 'REMOVE'; overlayId: string }
  | { type: 'CLOSE_ALL' }
  | { type: 'REMOVE_ALL' };

/**
 * External Events 시스템 이벤트 타입
 */
export interface OverlayEvent extends Record<string, (...args: any[]) => void> {
  /** 오버레이 열기 */
  open: (args: { controller: OverlayControllerComponent; overlayId: string; componentKey: string }) => void;
  /** 오버레이 닫기 */
  close: (overlayId: string) => void;
  /** 오버레이 언마운트 */
  unmount: (overlayId: string) => void;
  /** 모든 오버레이 닫기 */
  closeAll: () => void;
  /** 모든 오버레이 언마운트 */
  unmountAll: () => void;
}

/**
 * overlay.open() 옵션 타입
 */
export interface OpenOverlayOptions {
  /** 사용자 지정 오버레이 ID */
  overlayId?: string;
}

/**
 * overlay-kit 메인 API 인터페이스
 */
export interface OverlayAPI {
  /**
   * 오버레이를 열고 ID를 반환
   * 
   * @param controller - Controller 컴포넌트
   * @param options - 옵션 설정
   * @returns 오버레이 ID
   */
  open(controller: OverlayControllerComponent, options?: OpenOverlayOptions): string;

  /**
   * 비동기로 오버레이를 열고 Promise 반환
   * 
   * @template T - 반환값 타입
   * @param controller - 비동기 Controller 컴포넌트
   * @param options - 옵션 설정
   * @returns Promise<T> - close로 전달된 결과값
   */
  openAsync<T>(controller: OverlayAsyncControllerComponent<T>, options?: OpenOverlayOptions): Promise<T>;

  /**
   * 특정 오버레이 닫기
   * 
   * @param overlayId - 오버레이 ID
   */
  close(overlayId: string): void;

  /**
   * 특정 오버레이 언마운트
   * 
   * @param overlayId - 오버레이 ID
   */
  unmount(overlayId: string): void;

  /**
   * 모든 오버레이 닫기
   */
  closeAll(): void;

  /**
   * 모든 오버레이 언마운트
   */
  unmountAll(): void;
}

/**
 * ContentOverlayController Props
 * 개별 오버레이를 렌더링하고 생명주기를 관리하는 컴포넌트
 */
export interface ContentOverlayControllerProps {
  /** 열림 상태 */
  isOpen: boolean;
  /** 오버레이 ID */
  overlayId: string;
  /** Reducer 디스패치 함수 */
  overlayDispatch: React.Dispatch<OverlayReducerAction>;
  /** Controller 컴포넌트 */
  controller: OverlayControllerComponent;
}

/**
 * createOverlayProvider 반환 타입
 */
export interface OverlayProviderResult {
  /** 메인 API */
  overlay: OverlayAPI;
  /** Provider 컴포넌트 */
  OverlayProvider: React.FC<{ children: React.ReactNode }>;
  /** 현재 오버레이 조회 훅 */
  useCurrentOverlay: () => string | null;
  /** 오버레이 데이터 조회 훅 */
  useOverlayData: () => OverlayData;
}

/**
 * External Events 생성 함수 타입
 */
export type CreateEventFunction<T extends Record<string, (...args: any[]) => void>, K extends keyof T> = 
  (...args: Parameters<T[K]>) => void;

/**
 * External Events 훅 타입
 */
export type UseExternalEvents<T extends Record<string, (...args: any[]) => void>> = (events: T) => void;

/**
 * Portal 렌더러 Props
 */
export interface OverlayRendererProps {
  /** Reducer 상태 */
  overlayState: OverlayData;
  /** Reducer 디스패치 */
  dispatch: React.Dispatch<OverlayReducerAction>;
}

/**
 * Emitter 인터페이스
 */
export interface EventEmitter<T extends Record<string, (...args: any[]) => void>> {
  on<K extends keyof T>(eventName: K, handler: T[K]): void;
  off<K extends keyof T>(eventName: K, handler: T[K]): void;
  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void;
  removeAllListeners(): void;
}

/**
 * SafeContext 생성 결과
 */
export interface SafeContextResult<T> {
  /** Context Provider */
  OverlayContextProvider: React.FC<{ value: T; children: React.ReactNode }>;
  /** 현재 오버레이 조회 */
  useCurrentOverlay: () => string | null;
  /** 오버레이 데이터 조회 */
  useOverlayData: () => T;
}

// 타입 유틸리티 타입들
export type OverlayId = string;
export type ComponentKey = string;

/**
 * 오버레이 에러 클래스
 */
export class OverlayError extends Error {
  constructor(
    message: string,
    public code: string,
    public overlayId?: string
  ) {
    super(message);
    this.name = 'OverlayError';
  }
}

/**
 * 오버레이 에러 코드 상수
 */
export const OVERLAY_ERROR_CODES = {
  /** 동일 ID로 여러 오버레이 열기 시도 */
  DUPLICATE_OVERLAY_ID: 'DUPLICATE_OVERLAY_ID',
  /** 오버레이를 찾을 수 없음 */
  OVERLAY_NOT_FOUND: 'OVERLAY_NOT_FOUND',
  /** 포털 루트를 찾을 수 없음 */
  PORTAL_ROOT_NOT_FOUND: 'PORTAL_ROOT_NOT_FOUND',
  /** Context Provider가 없음 */
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
} as const;

export type OverlayErrorCode = typeof OVERLAY_ERROR_CODES[keyof typeof OVERLAY_ERROR_CODES];

// 빈 export
// index.ts에서 개별 import 사용
// import { OverlayControllerComponent } from '@/shared/ui/overlay/types/overlay.types'