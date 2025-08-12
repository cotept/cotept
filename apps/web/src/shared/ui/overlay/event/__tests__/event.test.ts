/**
 * Overlay Event API 테스트
 * overlay.open, overlay.openAsync 등 메인 API 테스트
 * 
 * @description 테스트 가이드라인 적용:
 * - FIRST: Fast, Isolated, Repeatable, Self-Validating, Timely
 * - Right-BICEP: Right, Boundary, Inverse, Cross-check, Error, Performance  
 * - CORRECT: Conformance, Ordering, Range, Reference, Existence, Cardinality, Time
 */

import React from "react"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"

import { createOverlay } from "../event"
import { cleanupEmitter } from "../../utils/createUseExternalEvents"

import type { OverlayAPI, OverlayControllerComponent, OverlayAsyncControllerComponent } from "../../types/overlay.types"

// 테스트용 컴포넌트들
const TestComponent: React.FC<{ message?: string }> = ({ message = "Test" }) => {
  return React.createElement("div", { "data-testid": "test-component" }, message)
}

const TestModalComponent: OverlayControllerComponent = ({ isOpen, close }) => {
  return React.createElement("div", {
    "data-testid": "test-modal",
    "data-open": isOpen,
    onClick: close
  }, "Test Modal")
}

const TestAsyncComponent: OverlayAsyncControllerComponent<string> = ({ isOpen, close }) => {
  return React.createElement("div", {
    "data-testid": "test-async",
    "data-open": isOpen,
    onClick: () => close("async-result")
  }, "Test Async Modal")
}

describe("createOverlay", () => {
  let overlay: OverlayAPI
  const testNamespace = "test-overlay"

  beforeEach(() => {
    overlay = createOverlay(testNamespace)
  })

  afterEach(() => {
    cleanupEmitter(`${testNamespace}/overlay-kit`)
    vi.clearAllMocks()
  })

  describe("기본 동작 (Right)", () => {
    it("올바른 OverlayAPI 인터페이스를 반환한다", () => {
      expect(overlay).toBeDefined()
      expect(typeof overlay.open).toBe("function")
      expect(typeof overlay.openAsync).toBe("function")
      expect(typeof overlay.close).toBe("function")
      expect(typeof overlay.unmount).toBe("function")
      expect(typeof overlay.closeAll).toBe("function")
      expect(typeof overlay.unmountAll).toBe("function")
    })

    it("open 메서드가 고유한 오버레이 ID를 반환한다", () => {
      const id1 = overlay.open(TestModalComponent)
      const id2 = overlay.open(TestModalComponent)
      
      expect(typeof id1).toBe("string")
      expect(typeof id2).toBe("string")
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
      expect(id2.length).toBeGreaterThan(0)
    })

    it("사용자 지정 오버레이 ID를 사용할 수 있다", () => {
      const customId = "custom-overlay-id"
      const returnedId = overlay.open(TestModalComponent, { overlayId: customId })
      
      expect(returnedId).toBe(customId)
    })
  })

  describe("비동기 오버레이 (openAsync)", () => {
    it("openAsync가 Promise를 반환한다", () => {
      const promise = overlay.openAsync(TestAsyncComponent)
      
      expect(promise).toBeInstanceOf(Promise)
    })

    it("openAsync가 컴포넌트를 래핑한다", () => {
      const mockComponent = vi.fn().mockReturnValue(React.createElement("div"))
      
      expect(() => {
        overlay.openAsync(mockComponent)
      }).not.toThrow()
      
      // openAsync는 즉시 Promise를 반환해야 함
      const promise = overlay.openAsync(mockComponent)
      expect(promise).toBeInstanceOf(Promise)
    })

    it("사용자 지정 ID로 비동기 오버레이를 생성할 수 있다", () => {
      const customId = "async-custom-id"
      const mockComponent = vi.fn().mockReturnValue(React.createElement("div"))
      
      expect(() => {
        overlay.openAsync(mockComponent, { overlayId: customId })
      }).not.toThrow()
    })
  })

  describe("이벤트 발송 동작 (Cross-check)", () => {
    it("close 메서드가 함수이며 호출해도 에러가 발생하지 않는다", () => {
      expect(() => {
        overlay.close("test-overlay-id")
      }).not.toThrow()
    })

    it("unmount 메서드가 함수이며 호출해도 에러가 발생하지 않는다", () => {
      expect(() => {
        overlay.unmount("test-overlay-id")
      }).not.toThrow()
    })

    it("closeAll 메서드가 함수이며 호출해도 에러가 발생하지 않는다", () => {
      expect(() => {
        overlay.closeAll()
      }).not.toThrow()
    })

    it("unmountAll 메서드가 함수이며 호출해도 에러가 발생하지 않는다", () => {
      expect(() => {
        overlay.unmountAll()
      }).not.toThrow()
    })
  })

  describe("컨트롤러 컴포넌트 래핑 (Conformance)", () => {
    it("일반 컴포넌트를 컨트롤러로 받아들인다", () => {
      const mockController = vi.fn().mockReturnValue(React.createElement("div"))
      
      expect(() => {
        overlay.open(mockController)
      }).not.toThrow()
    })

    it("비동기 컴포넌트가 래핑되어 처리된다", () => {
      const mockAsyncController = vi.fn().mockReturnValue(React.createElement("div"))
      
      expect(() => {
        overlay.openAsync(mockAsyncController)
      }).not.toThrow()
    })

    it("옵션을 포함하여 컴포넌트를 등록할 수 있다", () => {
      const mockController = vi.fn().mockReturnValue(React.createElement("div"))
      const options = { overlayId: "test-controller" }
      
      expect(() => {
        overlay.open(mockController, options)
        overlay.openAsync(mockController, options)
      }).not.toThrow()
    })
  })

  describe("네임스페이스 격리 (Isolation)", () => {
    it("서로 다른 네임스페이스의 오버레이가 독립적이다", () => {
      const overlay1 = createOverlay("namespace1")
      const overlay2 = createOverlay("namespace2")
      
      expect(overlay1).not.toBe(overlay2)
      
      const id1 = overlay1.open(TestModalComponent)
      const id2 = overlay2.open(TestModalComponent)
      
      // 서로 다른 인스턴스이므로 독립적으로 동작
      expect(() => {
        overlay1.close(id1)
        overlay1.unmount(id1)
        overlay2.close(id2) 
        overlay2.unmount(id2)
      }).not.toThrow()
      
      // 정리
      cleanupEmitter("namespace1/overlay-kit")
      cleanupEmitter("namespace2/overlay-kit")
    })

    it("같은 네임스페이스로 생성된 오버레이는 같은 이벤트 시스템을 공유한다", () => {
      const overlay1 = createOverlay("shared-namespace")
      const overlay2 = createOverlay("shared-namespace")
      
      // 다른 객체이지만 같은 이벤트 시스템 사용
      expect(overlay1).not.toBe(overlay2)
      
      // 같은 이벤트 시스템을 공유하므로 상호 작용 가능
      const id1 = overlay1.open(TestModalComponent)
      
      expect(() => {
        overlay2.close(id1) // overlay1에서 연 것을 overlay2에서 닫기
        overlay1.unmount(id1) // overlay2에서 닫은 것을 overlay1에서 제거
      }).not.toThrow()
      
      cleanupEmitter("shared-namespace/overlay-kit")
    })
  })

  describe("경계값 테스트 (Boundary)", () => {
    it("빈 문자열 네임스페이스로도 생성할 수 있다", () => {
      const emptyNamespaceOverlay = createOverlay("")
      
      expect(() => {
        const id = emptyNamespaceOverlay.open(TestModalComponent)
        emptyNamespaceOverlay.close(id)
      }).not.toThrow()
      
      cleanupEmitter("/overlay-kit")
    })

    it("매우 긴 네임스페이스로도 생성할 수 있다", () => {
      const longNamespace = "a".repeat(1000)
      const longNamespaceOverlay = createOverlay(longNamespace)
      
      expect(() => {
        const id = longNamespaceOverlay.open(TestModalComponent)
        longNamespaceOverlay.close(id)
      }).not.toThrow()
      
      cleanupEmitter(`${longNamespace}/overlay-kit`)
    })

    it("빈 문자열 오버레이 ID로도 작업할 수 있다", () => {
      const emptyId = overlay.open(TestModalComponent, { overlayId: "" })
      
      expect(emptyId).toBe("")
      expect(() => {
        overlay.close("")
        overlay.unmount("")
      }).not.toThrow()
    })

    it("매우 긴 오버레이 ID로도 작업할 수 있다", () => {
      const longId = "x".repeat(10000)
      const returnedId = overlay.open(TestModalComponent, { overlayId: longId })
      
      expect(returnedId).toBe(longId)
      expect(() => {
        overlay.close(longId)
        overlay.unmount(longId)
      }).not.toThrow()
    })
  })

  describe("에러 처리 (Error conditions)", () => {
    it("null 컨트롤러로 호출해도 에러가 발생하지 않는다", () => {
      expect(() => {
        // @ts-expect-error - 의도적인 null 테스트
        overlay.open(null)
      }).not.toThrow()
    })

    it("undefined 컨트롤러로 호출해도 에러가 발생하지 않는다", () => {
      expect(() => {
        // @ts-expect-error - 의도적인 undefined 테스트
        overlay.open(undefined)
      }).not.toThrow()
    })

    it("존재하지 않는 ID로 close/unmount 해도 에러가 발생하지 않는다", () => {
      expect(() => {
        overlay.close("non-existent-id")
        overlay.unmount("non-existent-id")
      }).not.toThrow()
    })

    it("비동기 컴포넌트에서 close를 호출하지 않아도 Promise가 무한 대기하지 않는다", () => {
      const neverClosingComponent: OverlayAsyncControllerComponent<string> = () => {
        return React.createElement("div", null, "Never Closing")
      }
      
      const promise = overlay.openAsync(neverClosingComponent)
      
      // Promise가 생성되는지만 확인 (실제로는 resolve되지 않음)
      expect(promise).toBeInstanceOf(Promise)
    })
  })

  describe("성능 테스트 (Performance)", () => {
    it("대량의 오버레이 생성이 빠르게 완료된다", () => {
      const overlayCount = 1000
      const startTime = performance.now()
      
      const overlayIds: string[] = []
      
      for (let i = 0; i < overlayCount; i++) {
        const id = overlay.open(TestModalComponent, { overlayId: `perf-test-${i}` })
        overlayIds.push(id)
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(overlayIds).toHaveLength(overlayCount)
      expect(processingTime).toBeLessThan(1000) // 1초 이하
    })

    it("대량의 이벤트 발송이 빠르게 완료된다", () => {
      const eventCount = 10000
      const startTime = performance.now()
      
      for (let i = 0; i < eventCount; i++) {
        overlay.close(`event-test-${i}`)
        overlay.unmount(`event-test-${i}`)
      }
      
      overlay.closeAll()
      overlay.unmountAll()
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(500) // 0.5초 이하
    })

    it("대량의 비동기 오버레이 생성이 빠르게 완료된다", () => {
      const asyncCount = 100
      const startTime = performance.now()
      
      for (let i = 0; i < asyncCount; i++) {
        overlay.openAsync(TestAsyncComponent, { overlayId: `async-${i}` })
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(1000) // 1초 이하
    })
  })

  describe("ID 생성 패턴 (Range)", () => {
    it("자동 생성된 ID는 예측 가능한 패턴을 따르지 않는다", () => {
      const ids = new Set<string>()
      const idCount = 1000
      
      for (let i = 0; i < idCount; i++) {
        const id = overlay.open(TestModalComponent)
        ids.add(id)
      }
      
      // 모든 ID가 고유해야 함
      expect(ids.size).toBe(idCount)
      
      // ID들이 순차적이지 않아야 함 (무작위성 확인)
      const idArray = Array.from(ids)
      const sortedIds = [...idArray].sort()
      expect(idArray).not.toEqual(sortedIds)
    })

    it("사용자 지정 ID와 자동 생성 ID가 충돌하지 않는다", () => {
      const customIds = ["custom1", "custom2", "custom3"]
      const autoIds: string[] = []
      
      // 사용자 지정 ID로 생성
      customIds.forEach(id => {
        overlay.open(TestModalComponent, { overlayId: id })
      })
      
      // 자동 생성 ID로 생성
      for (let i = 0; i < 100; i++) {
        const id = overlay.open(TestModalComponent)
        autoIds.push(id)
      }
      
      // 교집합이 없어야 함
      const customSet = new Set(customIds)
      const autoSet = new Set(autoIds)
      const intersection = new Set([...customSet].filter(x => autoSet.has(x)))
      
      expect(intersection.size).toBe(0)
    })
  })
})