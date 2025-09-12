import { OVERLAY_ERROR_CODES,OverlayError } from "../../types/overlay.types"
import { determineCurrentOverlayId,overlayReducer } from "../reducer"

import type { OverlayData, OverlayItem, OverlayReducerAction } from "../../types/overlay.types"

// 테스트용 오버레이 아이템 생성 헬퍼
const createOverlayItem = (id: string, isOpen = true, isMounted = true): OverlayItem => ({
  id,
  componentKey: `${id}-key`,
  isOpen,
  isMounted,
  controller: () => null,
})

// 테스트용 초기 상태
const initialState: OverlayData = {
  current: null,
  overlayOrderList: [],
  overlayData: {},
}

describe("determineCurrentOverlayId", () => {
  describe("기본 동작 (Right)", () => {
    it("마지막 오버레이를 닫으면 이전 오버레이를 반환한다", () => {
      const overlayOrderList = ["overlay1", "overlay2", "overlay3"]
      const overlayData = {
        overlay1: createOverlayItem("overlay1"),
        overlay2: createOverlayItem("overlay2"),
        overlay3: createOverlayItem("overlay3"),
      }
      
      const result = determineCurrentOverlayId(overlayOrderList, overlayData, "overlay3")
      
      expect(result).toBe("overlay2")
    })

    it("중간 오버레이를 닫으면 마지막 오버레이를 반환한다", () => {
      const overlayOrderList = ["overlay1", "overlay2", "overlay3", "overlay4"]
      const overlayData = {
        overlay1: createOverlayItem("overlay1"),
        overlay2: createOverlayItem("overlay2"),
        overlay3: createOverlayItem("overlay3"),
        overlay4: createOverlayItem("overlay4"),
      }
      
      const result = determineCurrentOverlayId(overlayOrderList, overlayData, "overlay2")
      
      expect(result).toBe("overlay4")
    })

    it("유일한 오버레이를 닫으면 null을 반환한다", () => {
      const overlayOrderList = ["overlay1"]
      const overlayData = {
        overlay1: createOverlayItem("overlay1"),
      }
      
      const result = determineCurrentOverlayId(overlayOrderList, overlayData, "overlay1")
      
      expect(result).toBeNull()
    })
  })

  describe("닫힌 오버레이 필터링 (Inverse)", () => {
    it("닫힌 오버레이는 고려하지 않는다", () => {
      const overlayOrderList = ["overlay1", "overlay2", "overlay3"]
      const overlayData = {
        overlay1: createOverlayItem("overlay1"),
        overlay2: createOverlayItem("overlay2", false), // 닫힌 상태
        overlay3: createOverlayItem("overlay3"),
      }
      
      const result = determineCurrentOverlayId(overlayOrderList, overlayData, "overlay3")
      
      expect(result).toBe("overlay1") // overlay2는 닫혀있으므로 overlay1 반환
    })

    it("모든 오버레이가 닫힌 상태면 null을 반환한다", () => {
      const overlayOrderList = ["overlay1", "overlay2"]
      const overlayData = {
        overlay1: createOverlayItem("overlay1", false),
        overlay2: createOverlayItem("overlay2", false),
      }
      
      const result = determineCurrentOverlayId(overlayOrderList, overlayData, "overlay1")
      
      expect(result).toBeNull()
    })
  })

  describe("경계값 테스트 (Boundary)", () => {
    it("빈 오버레이 목록에서는 null을 반환한다", () => {
      const result = determineCurrentOverlayId([], {}, "nonexistent")
      
      expect(result).toBeNull()
    })

    it("존재하지 않는 오버레이 ID를 전달해도 마지막 오버레이를 반환한다", () => {
      const overlayOrderList = ["overlay1", "overlay2"]
      const overlayData = {
        overlay1: createOverlayItem("overlay1"),
        overlay2: createOverlayItem("overlay2"),
      }
      
      const result = determineCurrentOverlayId(overlayOrderList, overlayData, "nonexistent")
      
      expect(result).toBe("overlay2")
    })
  })
})

describe("overlayReducer", () => {
  describe("ADD 액션 (Cardinality)", () => {
    it("새 오버레이를 추가하면 상태가 올바르게 업데이트된다", () => {
      const overlay = createOverlayItem("overlay1")
      const action: OverlayReducerAction = { type: "ADD", overlay }
      
      const result = overlayReducer(initialState, action)
      
      expect(result).toEqual({
        current: "overlay1",
        overlayOrderList: ["overlay1"],
        overlayData: {
          overlay1: overlay,
        },
      })
    })

    it("여러 오버레이를 순서대로 추가하면 순서가 유지된다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      
      expect(state.overlayOrderList).toEqual(["overlay1", "overlay2"])
      expect(state.current).toBe("overlay2")
    })

    it("닫힌 오버레이를 다시 열면 상태만 변경되고 순서는 유지된다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      // 두 오버레이 추가
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      
      // overlay1 닫기 (overlayOrderList에는 남아있음)
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay1" })
      expect(state.overlayOrderList).toEqual(["overlay1", "overlay2"])
      expect(state.overlayData.overlay1.isOpen).toBe(false)
      
      // overlay1 다시 열기 (순서 변경 없이 상태만 변경)
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      
      expect(state.overlayOrderList).toEqual(["overlay1", "overlay2"])
      expect(state.overlayData.overlay1.isOpen).toBe(true)
      expect(state.current).toBe("overlay1")
    })

    it("제거된 오버레이를 다시 추가하면 맨 앞으로 이동한다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      // 두 오버레이 추가
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      
      // overlay1 제거 (overlayOrderList에서도 제거됨)
      state = overlayReducer(state, { type: "REMOVE", overlayId: "overlay1" })
      expect(state.overlayOrderList).toEqual(["overlay2"])
      expect(state.overlayData.overlay1).toBeUndefined()
      
      // overlay1 다시 추가 (맨 앞으로 이동)
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      
      expect(state.overlayOrderList).toEqual(["overlay2", "overlay1"])
      expect(state.current).toBe("overlay1")
    })

    it("동일 ID로 열린 오버레이가 있으면 OverlayError를 던진다", () => {
      const overlay = createOverlayItem("overlay1")
      const state = overlayReducer(initialState, { type: "ADD", overlay })

      try {
        overlayReducer(state, { type: "ADD", overlay })
        // 에러가 던져지지 않으면 테스트 실패
        expect.fail("OverlayError가 발생해야 합니다.")
      } catch (e) {
        const err = e as OverlayError
        expect(err).toBeInstanceOf(OverlayError)
        expect(err.message).toContain("You can't open the multiple overlays with the same overlayId(overlay1)")
        expect(err.code).toBe(OVERLAY_ERROR_CODES.DUPLICATE_OVERLAY_ID)
        expect(err.overlayId).toBe("overlay1")
      }
    })
  })

  describe("OPEN 액션 (Existence)", () => {
    it("닫힌 오버레이를 열면 상태가 업데이트된다", () => {
      let state = initialState
      const overlay = createOverlayItem("overlay1", false) // 닫힌 상태로 시작
      
      state = overlayReducer(state, { type: "ADD", overlay })
      state = overlayReducer(state, { type: "OPEN", overlayId: "overlay1" })
      
      expect(state.overlayData.overlay1.isOpen).toBe(true)
      expect(state.overlayData.overlay1.isMounted).toBe(true)
    })

    it("존재하지 않는 오버레이를 열려고 하면 상태가 변경되지 않는다", () => {
      const state = initialState
      
      const result = overlayReducer(state, { type: "OPEN", overlayId: "nonexistent" })
      
      expect(result).toBe(state)
    })

    it("이미 열린 오버레이를 열려고 하면 상태가 변경되지 않는다", () => {
      let state = initialState
      const overlay = createOverlayItem("overlay1") // 이미 열린 상태
      
      state = overlayReducer(state, { type: "ADD", overlay })
      const beforeState = { ...state }
      
      const result = overlayReducer(state, { type: "OPEN", overlayId: "overlay1" })
      
      expect(result).toEqual(beforeState)
    })
  })

  describe("CLOSE 액션 (Cross-check)", () => {
    it("오버레이를 닫으면 상태가 올바르게 업데이트된다", () => {
      let state = initialState
      const overlay = createOverlayItem("overlay1")
      
      state = overlayReducer(state, { type: "ADD", overlay })
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay1" })
      
      expect(state.overlayData.overlay1.isOpen).toBe(false)
      expect(state.current).toBeNull()
    })

    it("마지막 오버레이를 닫으면 이전 오버레이가 current가 된다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay2" })
      
      expect(state.current).toBe("overlay1")
      expect(state.overlayData.overlay2.isOpen).toBe(false)
    })

    it("존재하지 않는 오버레이를 닫으려고 하면 상태가 변경되지 않는다", () => {
      const state = initialState
      
      const result = overlayReducer(state, { type: "CLOSE", overlayId: "nonexistent" })
      
      expect(result).toBe(state)
    })

    it("이미 닫힌 오버레이를 닫으려고 하면 상태가 변경되지 않는다", () => {
      let state = initialState
      const overlay = createOverlayItem("overlay1", false) // 닫힌 상태
      
      state = overlayReducer(state, { type: "ADD", overlay })
      const beforeState = { ...state }
      
      const result = overlayReducer(state, { type: "CLOSE", overlayId: "overlay1" })
      
      expect(result).toEqual(beforeState)
    })
  })

  describe("REMOVE 액션 (Reference)", () => {
    it("오버레이를 제거하면 상태에서 완전히 사라진다", () => {
      let state = initialState
      const overlay = createOverlayItem("overlay1")
      
      state = overlayReducer(state, { type: "ADD", overlay })
      state = overlayReducer(state, { type: "REMOVE", overlayId: "overlay1" })
      
      expect(state.overlayOrderList).toEqual([])
      expect(state.overlayData).toEqual({})
      expect(state.current).toBeNull()
    })

    it("여러 오버레이 중 하나를 제거하면 나머지는 유지된다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      state = overlayReducer(state, { type: "REMOVE", overlayId: "overlay1" })
      
      expect(state.overlayOrderList).toEqual(["overlay2"])
      expect(state.overlayData).toEqual({ overlay2 })
      expect(state.current).toBe("overlay2")
    })

    it("존재하지 않는 오버레이를 제거하려고 하면 상태가 변경되지 않는다", () => {
      const state = initialState
      
      const result = overlayReducer(state, { type: "REMOVE", overlayId: "nonexistent" })
      
      expect(result).toBe(state)
    })
  })

  describe("CLOSE_ALL 액션 (Ordering)", () => {
    it("모든 오버레이가 닫히고 current가 null이 된다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      state = overlayReducer(state, { type: "CLOSE_ALL" })
      
      expect(state.current).toBeNull()
      expect(state.overlayData.overlay1.isOpen).toBe(false)
      expect(state.overlayData.overlay2.isOpen).toBe(false)
      expect(state.overlayOrderList).toEqual(["overlay1", "overlay2"]) // 순서는 유지
    })

    it("오버레이가 없을 때 CLOSE_ALL을 실행해도 상태가 변경되지 않는다", () => {
      const state = initialState
      
      const result = overlayReducer(state, { type: "CLOSE_ALL" })
      
      expect(result).toBe(state)
    })
  })

  describe("REMOVE_ALL 액션 (Time)", () => {
    it("모든 오버레이가 제거되고 초기 상태가 된다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      state = overlayReducer(state, { type: "REMOVE_ALL" })
      
      expect(state).toEqual(initialState)
    })
  })

  describe("복합 시나리오 (Cross-check)", () => {
    it("오버레이 생성 → 닫기 → 다시 열기 → 제거 순서가 올바르게 동작한다", () => {
      let state = initialState
      const overlay = createOverlayItem("overlay1")
      
      // 추가
      state = overlayReducer(state, { type: "ADD", overlay })
      expect(state.current).toBe("overlay1")
      expect(state.overlayData.overlay1.isOpen).toBe(true)
      
      // 닫기
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay1" })
      expect(state.current).toBeNull()
      expect(state.overlayData.overlay1.isOpen).toBe(false)
      
      // 다시 열기
      state = overlayReducer(state, { type: "ADD", overlay })
      expect(state.current).toBe("overlay1")
      expect(state.overlayData.overlay1.isOpen).toBe(true)
      
      // 제거
      state = overlayReducer(state, { type: "REMOVE", overlayId: "overlay1" })
      expect(state).toEqual(initialState)
    })

    it("여러 오버레이의 중첩 열기/닫기가 올바르게 동작한다", () => {
      let state = initialState
      const overlay1 = createOverlayItem("overlay1")
      const overlay2 = createOverlayItem("overlay2")
      const overlay3 = createOverlayItem("overlay3")
      
      // 1, 2, 3 순서로 열기
      state = overlayReducer(state, { type: "ADD", overlay: overlay1 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay2 })
      state = overlayReducer(state, { type: "ADD", overlay: overlay3 })
      
      expect(state.current).toBe("overlay3")
      expect(state.overlayOrderList).toEqual(["overlay1", "overlay2", "overlay3"])
      
      // 중간(2) 닫기 - current는 마지막(3)이 되어야 함
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay2" })
      expect(state.current).toBe("overlay3")
      
      // 마지막(3) 닫기 - current는 이전(1)이 되어야 함 (2는 닫혀있으므로)
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay3" })
      expect(state.current).toBe("overlay1")
      
      // 마지막(1) 닫기 - current는 null
      state = overlayReducer(state, { type: "CLOSE", overlayId: "overlay1" })
      expect(state.current).toBeNull()
    })
  })

  describe("성능 (Performance)", () => {
    it("대용량 오버레이 처리가 빠르게 완료된다", () => {
      let state = initialState
      const overlayCount = 1000
      
      const startTime = performance.now()
      
      // 1000개 오버레이 추가
      for (let i = 0; i < overlayCount; i++) {
        const overlay = createOverlayItem(`overlay${i}`)
        state = overlayReducer(state, { type: "ADD", overlay })
      }
      
      // 모든 오버레이 제거
      state = overlayReducer(state, { type: "REMOVE_ALL" })
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(1000) // 1초 이하
      expect(state).toEqual(initialState)
    })
  })

  describe("에러 처리 (Error conditions)", () => {
    it("잘못된 액션 타입에 대해서도 에러가 발생하지 않는다", () => {
      const state = initialState
      
      expect(() => {
        // @ts-expect-error - 잘못된 액션 타입 테스트
        overlayReducer(state, { type: "INVALID_ACTION" })
      }).not.toThrow()
    })

    it("null 또는 undefined 오버레이 데이터로도 안전하게 동작한다", () => {
      const state: OverlayData = {
        current: null,
        overlayOrderList: ["overlay1"],
        overlayData: {
          overlay1: null as any, // null 오버레이 데이터
        },
      }
      
      expect(() => {
        overlayReducer(state, { type: "CLOSE", overlayId: "overlay1" })
      }).not.toThrow()
    })
  })
})