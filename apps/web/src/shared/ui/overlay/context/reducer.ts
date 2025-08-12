/**
 * Overlay Reducer 구현 (overlay-kit 방식)
 * 오버레이 상태 관리를 위한 순수 함수 기반 상태 변화
 */

import { OVERLAY_ERROR_CODES, OverlayError } from "../types/overlay.types"

import type { OverlayData, OverlayItem, OverlayReducerAction } from "../types/overlay.types"

/**
 * 오버레이가 닫히거나 제거될 때 현재 활성 오버레이를 결정
 *
 * @description 마지막 오버레이를 닫으면 이전 오버레이를 지정
 * @description 중간 오버레이를 닫으면 마지막 오버레이를 지정
 *
 * @example
 * open - [1, 2, 3, 4]
 * close 2 => current: 4
 * close 4 => current: 3
 * close 3 => current: 1
 * close 1 => current: null
 *
 * @param overlayOrderList - 오버레이 순서 리스트
 * @param overlayData - 오버레이 데이터 맵
 * @param targetOverlayId - 닫히거나 제거될 오버레이 ID
 * @returns 새로운 현재 오버레이 ID 또는 null
 */
export const determineCurrentOverlayId = (
  overlayOrderList: string[],
  overlayData: Record<string, OverlayItem>,
  targetOverlayId: string,
): string | null => {
  // 열려있는 오버레이들만 필터링
  const openedOverlayOrderList = overlayOrderList.filter(
    (orderedOverlayId) => overlayData[orderedOverlayId]?.isOpen === true,
  )

  // 타겟 오버레이의 인덱스 찾기
  const targetIndexInOpenedList = openedOverlayOrderList.findIndex((item) => item === targetOverlayId)

  // 타겟이 마지막 오버레이인 경우 이전 오버레이 반환
  // 그렇지 않으면 마지막 오버레이 반환
  return targetIndexInOpenedList === openedOverlayOrderList.length - 1
    ? (openedOverlayOrderList[targetIndexInOpenedList - 1] ?? null)
    : (openedOverlayOrderList.at(-1) ?? null)
}

/**
 * Overlay Reducer 메인 함수
 * overlay-kit의 정확한 로직 구현
 */
export function overlayReducer(state: OverlayData, action: OverlayReducerAction): OverlayData {
  switch (action.type) {
    case "ADD": {
      // 기존에 닫혀있는 오버레이가 있으면 다시 열기
      if (state.overlayData[action.overlay.id] != null && state.overlayData[action.overlay.id].isOpen === false) {
        const overlay = state.overlayData[action.overlay.id]

        // 오버레이가 없거나 이미 열려있으면 무시
        if (overlay == null || overlay.isOpen) {
          return state
        }

        return {
          ...state,
          current: action.overlay.id,
          overlayData: {
            ...state.overlayData,
            [action.overlay.id]: { ...overlay, isOpen: true },
          },
        }
      }

      // 새 오버레이 추가 또는 기존 오버레이 처리
      const isExisted = state.overlayOrderList.includes(action.overlay.id)

      // 동일 ID로 이미 열린 오버레이가 있으면 에러
      if (isExisted && state.overlayData[action.overlay.id].isOpen === true) {
        throw new OverlayError(
          `You can't open the multiple overlays with the same overlayId(${action.overlay.id}). Please set a different id.`,
          OVERLAY_ERROR_CODES.DUPLICATE_OVERLAY_ID,
          action.overlay.id,
        )
      }

      return {
        current: action.overlay.id,
        // 재개방 시 맨 앞으로 이동 (Z-index 최상위)
        overlayOrderList: [...state.overlayOrderList.filter((item) => item !== action.overlay.id), action.overlay.id],
        overlayData: isExisted
          ? state.overlayData // 기존 데이터 유지
          : {
              ...state.overlayData,
              [action.overlay.id]: action.overlay,
            },
      }
    }

    case "OPEN": {
      const overlay = state.overlayData[action.overlayId]

      // 오버레이가 없거나 이미 열려있으면 무시
      if (overlay == null || overlay.isOpen) {
        return state
      }

      return {
        ...state,
        overlayData: {
          ...state.overlayData,
          [action.overlayId]: { ...overlay, isOpen: true, isMounted: true },
        },
      }
    }

    case "CLOSE": {
      const overlay = state.overlayData[action.overlayId]

      // 오버레이가 없거나 이미 닫혀있으면 무시
      if (overlay == null || !overlay.isOpen) {
        return state
      }

      const currentOverlayId = determineCurrentOverlayId(state.overlayOrderList, state.overlayData, action.overlayId)

      return {
        ...state,
        current: currentOverlayId,
        overlayData: {
          ...state.overlayData,
          [action.overlayId]: {
            ...state.overlayData[action.overlayId],
            isOpen: false,
          },
        },
      }
    }

    case "REMOVE": {
      const overlay = state.overlayData[action.overlayId]

      // 오버레이가 없으면 무시
      if (overlay == null) {
        return state
      }

      const remainingOverlays = state.overlayOrderList.filter((item) => item !== action.overlayId)
      if (state.overlayOrderList.length === remainingOverlays.length) {
        return state
      }

      // 오버레이 데이터에서 제거
      const copiedOverlayData = { ...state.overlayData }
      delete copiedOverlayData[action.overlayId]

      const currentOverlayId = determineCurrentOverlayId(state.overlayOrderList, state.overlayData, action.overlayId)

      return {
        current: currentOverlayId,
        overlayOrderList: remainingOverlays,
        overlayData: copiedOverlayData,
      }
    }

    case "CLOSE_ALL": {
      // 오버레이가 없으면 무시
      if (Object.keys(state.overlayData).length === 0) {
        return state
      }

      return {
        ...state,
        current: null,
        overlayData: Object.keys(state.overlayData).reduce(
          (prev, curr) => ({
            ...prev,
            [curr]: {
              ...state.overlayData[curr],
              isOpen: false,
            } satisfies OverlayItem,
          }),
          {} satisfies Record<string, OverlayItem>,
        ),
      }
    }

    case "REMOVE_ALL": {
      return {
        current: null,
        overlayOrderList: [],
        overlayData: {},
      }
    }
  }
}
