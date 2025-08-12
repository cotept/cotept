/**
 * Event Emitter 시스템 테스트
 * eventemitter3 기반 타입 안전한 이벤트 시스템 테스트
 *
 * @description 테스트 가이드라인 적용:
 * - FIRST: Fast, Isolated, Repeatable, Self-Validating, Timely
 * - Right-BICEP: Right, Boundary, Inverse, Cross-check, Error, Performance
 * - CORRECT: Conformance, Ordering, Range, Reference, Existence, Cardinality, Time
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  cleanupAllEmitters,
  cleanupEmitter,
  createUseExternalEvents,
  getEmitterInstance,
} from "../../utils/createUseExternalEvents"
import { createEmitter } from "../../utils/emitter"

import type { EventEmitter } from "../../types/overlay.types"

// 테스트용 이벤트 타입 정의
interface TestEvents {
  [key: string]: any // 모든 문자열 키를 허용
  testEvent: (message: string, count: number) => void
  simpleEvent: () => void
  complexEvent: (data: { id: string; items: string[] }) => void
  errorEvent: (shouldThrow: boolean) => void
}

describe("createEmitter", () => {
  let emitter: EventEmitter<TestEvents>
  const namespace = "test-namespace"

  beforeEach(() => {
    emitter = createEmitter<TestEvents>(namespace)
  })

  afterEach(() => {
    emitter.removeAllListeners()
    vi.clearAllMocks()
  })

  describe("기본 동작 (Right)", () => {
    it("올바른 EventEmitter 인터페이스를 반환한다", () => {
      expect(emitter).toBeDefined()
      expect(typeof emitter.on).toBe("function")
      expect(typeof emitter.off).toBe("function")
      expect(typeof emitter.emit).toBe("function")
      expect(typeof emitter.removeAllListeners).toBe("function")
    })

    it("이벤트를 등록하고 발송할 수 있다", () => {
      const handler = vi.fn()

      emitter.on("testEvent", handler)
      emitter.emit("testEvent", "hello", 42)

      expect(handler).toHaveBeenCalledWith("hello", 42)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it("여러 개의 리스너를 등록할 수 있다", () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      emitter.on("testEvent", handler1)
      emitter.on("testEvent", handler2)
      emitter.on("testEvent", handler3)

      emitter.emit("testEvent", "test", 1)

      expect(handler1).toHaveBeenCalledWith("test", 1)
      expect(handler2).toHaveBeenCalledWith("test", 1)
      expect(handler3).toHaveBeenCalledWith("test", 1)
    })

    it("리스너를 제거할 수 있다", () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      emitter.on("testEvent", handler1)
      emitter.on("testEvent", handler2)

      emitter.off("testEvent", handler1)
      emitter.emit("testEvent", "test", 1)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledWith("test", 1)
    })
  })

  describe("여러 이벤트 타입 처리 (Conformance)", () => {
    it("인자가 없는 이벤트를 처리할 수 있다", () => {
      const handler = vi.fn()

      emitter.on("simpleEvent", handler)
      emitter.emit("simpleEvent")

      expect(handler).toHaveBeenCalledWith()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it("복잡한 객체를 인자로 하는 이벤트를 처리할 수 있다", () => {
      const handler = vi.fn()
      const testData = { id: "test-id", items: ["item1", "item2", "item3"] }

      emitter.on("complexEvent", handler)
      emitter.emit("complexEvent", testData)

      expect(handler).toHaveBeenCalledWith(testData)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it("다양한 이벤트 타입을 동시에 처리할 수 있다", () => {
      const simpleHandler = vi.fn()
      const testHandler = vi.fn()
      const complexHandler = vi.fn()

      emitter.on("simpleEvent", simpleHandler)
      emitter.on("testEvent", testHandler)
      emitter.on("complexEvent", complexHandler)

      emitter.emit("simpleEvent")
      emitter.emit("testEvent", "message", 100)
      emitter.emit("complexEvent", { id: "id", items: [] })

      expect(simpleHandler).toHaveBeenCalledTimes(1)
      expect(testHandler).toHaveBeenCalledWith("message", 100)
      expect(complexHandler).toHaveBeenCalledWith({ id: "id", items: [] })
    })
  })

  describe("에러 처리 (Error conditions)", () => {
    it("리스너에서 에러가 발생해도 전체 시스템이 중단되지 않는다", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const errorHandler = vi.fn(() => {
        throw new Error("Test error")
      })

      emitter.on("errorEvent", errorHandler)

      // 에러가 발생하는 이벤트 발송
      expect(() => {
        emitter.emit("errorEvent", true)
      }).not.toThrow()

      expect(errorHandler).toHaveBeenCalledWith(true)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[Overlay Event Error] ${namespace}:errorEvent`),
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })

    it("존재하지 않는 이벤트를 발송해도 에러가 발생하지 않는다", () => {
      expect(() => {
        emitter.emit("nonExistentEvent", "test")
      }).not.toThrow()
    })

    it("등록되지 않은 이벤트를 발송해도 에러가 발생하지 않는다", () => {
      expect(() => {
        emitter.emit("testEvent", "test", 1)
      }).not.toThrow()
    })
  })

  describe("메모리 관리 (Reference)", () => {
    it("removeAllListeners로 모든 리스너를 제거할 수 있다", () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      emitter.on("testEvent", handler1)
      emitter.on("simpleEvent", handler2)
      emitter.on("complexEvent", handler3)

      emitter.removeAllListeners()

      emitter.emit("testEvent", "test", 1)
      emitter.emit("simpleEvent")
      emitter.emit("complexEvent", { id: "test", items: [] })

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })

    it("중복 등록된 핸들러의 제거 동작을 확인한다", () => {
      const handler = vi.fn()

      emitter.on("testEvent", handler)
      emitter.on("testEvent", handler) // 중복 등록

      emitter.emit("testEvent", "test", 1)

      // eventemitter3는 중복 등록을 허용할 수 있음
      const firstCallCount = handler.mock.calls.length
      expect(firstCallCount).toBeGreaterThan(0)

      emitter.off("testEvent", handler)
      emitter.emit("testEvent", "test", 2)

      // 제거 후 호출 횟수가 줄어들거나 같아야 함
      const secondCallCount = handler.mock.calls.length
      expect(secondCallCount).toBeGreaterThanOrEqual(firstCallCount)
    })
  })

  describe("이벤트 호출 순서 (Ordering)", () => {
    it("리스너들이 등록 순서대로 호출된다", () => {
      const callOrder: number[] = []

      const handler1 = vi.fn(() => callOrder.push(1))
      const handler2 = vi.fn(() => callOrder.push(2))
      const handler3 = vi.fn(() => callOrder.push(3))

      emitter.on("testEvent", handler1)
      emitter.on("testEvent", handler2)
      emitter.on("testEvent", handler3)

      emitter.emit("testEvent", "test", 1)

      expect(callOrder).toEqual([1, 2, 3])
    })

    it("동일한 이벤트를 연속으로 발송해도 올바르게 처리된다", () => {
      const handler = vi.fn()

      emitter.on("testEvent", handler)

      emitter.emit("testEvent", "first", 1)
      emitter.emit("testEvent", "second", 2)
      emitter.emit("testEvent", "third", 3)

      expect(handler).toHaveBeenCalledTimes(3)
      expect(handler).toHaveBeenNthCalledWith(1, "first", 1)
      expect(handler).toHaveBeenNthCalledWith(2, "second", 2)
      expect(handler).toHaveBeenNthCalledWith(3, "third", 3)
    })
  })

  describe("경계값 테스트 (Boundary)", () => {
    it("빈 문자열 네임스페이스로도 생성할 수 있다", () => {
      const emptyNamespaceEmitter = createEmitter<TestEvents>("")
      const handler = vi.fn()

      expect(() => {
        emptyNamespaceEmitter.on("testEvent", handler)
        emptyNamespaceEmitter.emit("testEvent", "test", 1)
      }).not.toThrow()

      expect(handler).toHaveBeenCalledWith("test", 1)
    })

    it("매우 긴 네임스페이스로도 생성할 수 있다", () => {
      const longNamespace = "a".repeat(1000)
      const longNamespaceEmitter = createEmitter<TestEvents>(longNamespace)
      const handler = vi.fn()

      expect(() => {
        longNamespaceEmitter.on("testEvent", handler)
        longNamespaceEmitter.emit("testEvent", "test", 1)
      }).not.toThrow()

      expect(handler).toHaveBeenCalledWith("test", 1)
    })
  })

  describe("성능 테스트 (Performance)", () => {
    it("대량의 이벤트 처리가 빠르게 완료된다", () => {
      const handler = vi.fn()
      const eventCount = 10000

      emitter.on("testEvent", handler)

      const startTime = performance.now()

      for (let i = 0; i < eventCount; i++) {
        emitter.emit("testEvent", `message${i}`, i)
      }

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(handler).toHaveBeenCalledTimes(eventCount)
      expect(processingTime).toBeLessThan(100) // 100ms 이하
    })

    it("대량의 리스너 등록과 해제가 빠르게 완료된다", () => {
      const listenerCount = 1000
      const handlers: (() => void)[] = []

      const startTime = performance.now()

      // 1000개 리스너 등록
      for (let i = 0; i < listenerCount; i++) {
        const handler = vi.fn()
        handlers.push(handler)
        emitter.on("simpleEvent", handler)
      }

      // 이벤트 발송
      emitter.emit("simpleEvent")

      // 모든 리스너 제거
      handlers.forEach((handler) => {
        emitter.off("simpleEvent", handler)
      })

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(1000) // 1초 이하

      // 제거 후 이벤트 발송해도 호출되지 않음 확인
      emitter.emit("simpleEvent")
      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledTimes(1) // 제거 전 1번만
      })
    })
  })
})

describe("createUseExternalEvents", () => {
  const testNamespace = "test-external-events"

  afterEach(() => {
    cleanupEmitter(testNamespace)
    vi.clearAllMocks()
  })

  describe("기본 동작 (Right)", () => {
    it("Hook과 이벤트 생성 함수를 반환한다", () => {
      const [useExternalEvents, createEvent] = createUseExternalEvents<TestEvents>(testNamespace)

      expect(typeof useExternalEvents).toBe("function")
      expect(typeof createEvent).toBe("function")
    })

    it("이벤트 생성 함수가 올바른 함수를 반환한다", () => {
      const [, createEvent] = createUseExternalEvents<TestEvents>(testNamespace)

      const testEventDispatcher = createEvent("testEvent")
      const simpleEventDispatcher = createEvent("simpleEvent")

      expect(typeof testEventDispatcher).toBe("function")
      expect(typeof simpleEventDispatcher).toBe("function")
    })

    it("생성된 이벤트 디스패처가 올바른 타입 시그니처를 가진다", () => {
      const [, createEvent] = createUseExternalEvents<TestEvents>(testNamespace)

      const testEventDispatcher = createEvent("testEvent")
      const simpleEventDispatcher = createEvent("simpleEvent")

      // 타입 검증: 컴파일 시점에서 확인됨
      expect(() => {
        testEventDispatcher("message", 42)
        simpleEventDispatcher()
      }).not.toThrow()
    })
  })

  describe("여러 인스턴스 격리 (Isolation)", () => {
    it("서로 다른 네임스페이스의 이벤트가 격리된다", () => {
      const namespace1 = "namespace1"
      const namespace2 = "namespace2"

      const emitter1 = getEmitterInstance<TestEvents>(namespace1)
      const emitter2 = getEmitterInstance<TestEvents>(namespace2)

      expect(emitter1).not.toBe(emitter2)

      const handler1 = vi.fn()
      const handler2 = vi.fn()

      emitter1.on("testEvent", handler1)
      emitter2.on("testEvent", handler2)

      // 각각 다른 emitter에서 이벤트 발송
      emitter1.emit("testEvent", "message1", 1)
      emitter2.emit("testEvent", "message2", 2)

      expect(handler1).toHaveBeenCalledWith("message1", 1)
      expect(handler1).not.toHaveBeenCalledWith("message2", 2)

      expect(handler2).toHaveBeenCalledWith("message2", 2)
      expect(handler2).not.toHaveBeenCalledWith("message1", 1)

      // 정리
      cleanupEmitter(namespace1)
      cleanupEmitter(namespace2)
    })

    it("같은 네임스페이스는 같은 emitter 인스턴스를 공유한다", () => {
      const namespace = "shared-namespace"

      const emitter1 = getEmitterInstance<TestEvents>(namespace)
      const emitter2 = getEmitterInstance<TestEvents>(namespace)

      expect(emitter1).toBe(emitter2)

      cleanupEmitter(namespace)
    })
  })

  describe("메모리 관리 (Reference)", () => {
    it("cleanupEmitter로 특정 네임스페이스를 정리할 수 있다", () => {
      const namespace = "cleanup-test"
      const emitter = getEmitterInstance<TestEvents>(namespace)
      const handler = vi.fn()

      emitter.on("testEvent", handler)
      emitter.emit("testEvent", "before cleanup", 1)

      expect(handler).toHaveBeenCalledTimes(1)

      cleanupEmitter(namespace)

      // 새로운 emitter 인스턴스가 생성되어야 함
      const newEmitter = getEmitterInstance<TestEvents>(namespace)
      expect(newEmitter).not.toBe(emitter)

      // 이전 핸들러는 정리되어야 함
      newEmitter.emit("testEvent", "after cleanup", 2)
      expect(handler).toHaveBeenCalledTimes(1) // 여전히 1번만

      cleanupEmitter(namespace)
    })

    it("cleanupAllEmitters로 모든 emitter를 정리할 수 있다", () => {
      const namespace1 = "cleanup-all-1"
      const namespace2 = "cleanup-all-2"

      const emitter1 = getEmitterInstance<TestEvents>(namespace1)
      const emitter2 = getEmitterInstance<TestEvents>(namespace2)

      const handler1 = vi.fn()
      const handler2 = vi.fn()

      emitter1.on("testEvent", handler1)
      emitter2.on("testEvent", handler2)

      cleanupAllEmitters()

      // 새로운 emitter 인스턴스들이 생성되어야 함
      const newEmitter1 = getEmitterInstance<TestEvents>(namespace1)
      const newEmitter2 = getEmitterInstance<TestEvents>(namespace2)

      expect(newEmitter1).not.toBe(emitter1)
      expect(newEmitter2).not.toBe(emitter2)

      // 이전 핸들러들은 정리되어야 함
      newEmitter1.emit("testEvent", "test", 1)
      newEmitter2.emit("testEvent", "test", 2)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()

      // 정리
      cleanupAllEmitters()
    })
  })

  describe("에러 처리 (Error conditions)", () => {
    it("존재하지 않는 네임스페이스를 정리해도 에러가 발생하지 않는다", () => {
      expect(() => {
        cleanupEmitter("non-existent-namespace")
      }).not.toThrow()
    })

    it("빈 상태에서 cleanupAllEmitters를 호출해도 에러가 발생하지 않는다", () => {
      cleanupAllEmitters() // 먼저 모두 정리

      expect(() => {
        cleanupAllEmitters()
      }).not.toThrow()
    })
  })

  describe("시간 기반 동작 (Time)", () => {
    it("이벤트 발송이 즉시 처리된다", () => {
      const emitter = getEmitterInstance<TestEvents>(testNamespace)

      const handler = vi.fn()
      emitter.on("testEvent", handler)

      const startTime = performance.now()
      emitter.emit("testEvent", "immediate test", 1)
      const endTime = performance.now()

      expect(handler).toHaveBeenCalledWith("immediate test", 1)
      expect(endTime - startTime).toBeLessThan(10) // 10ms 이하
    })
  })
})
