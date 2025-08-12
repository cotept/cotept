/**
 * Overlay Utilities 테스트
 * randomId, createSafeContext, createUseExternalEvents 등 유틸리티 함수 테스트
 *
 * @description 테스트 가이드라인 적용:
 * - FIRST: Fast, Isolated, Repeatable, Self-Validating, Timely
 * - Right-BICEP: Right, Boundary, Inverse, Cross-check, Error, Performance
 * - CORRECT: Conformance, Ordering, Range, Reference, Existence, Cardinality, Time
 */

import React from "react"

import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createOverlaySafeContext } from "../createSafeContext"
import {
  cleanupAllEmitters,
  cleanupEmitter,
  createUseExternalEvents,
  getEmitterInstance,
} from "../createUseExternalEvents"
import { createEmitter } from "../emitter"
import { randomId, timestampId, uuidId } from "../randomId"

import type { OverlayData } from "../../types/overlay.types"

describe("randomId", () => {
  describe("기본 동작 (Right)", () => {
    it("기본 길이 8자의 랜덤 문자열을 생성한다", () => {
      const id = randomId()

      expect(typeof id).toBe("string")
      expect(id.length).toBe(8)
      expect(/^[a-z0-9]+$/.test(id)).toBe(true)
    })

    it("지정된 길이의 랜덤 문자열을 생성한다", () => {
      const lengths = [1, 4, 16, 32, 100]

      lengths.forEach((length) => {
        const id = randomId(length)
        expect(id.length).toBe(length)
        expect(/^[a-z0-9]+$/.test(id)).toBe(true)
      })
    })

    it("매번 다른 문자열을 생성한다", () => {
      const ids = new Set<string>()
      const idCount = 1000

      for (let i = 0; i < idCount; i++) {
        ids.add(randomId())
      }

      // 모든 ID가 고유해야 함
      expect(ids.size).toBe(idCount)
    })
  })

  describe("경계값 테스트 (Boundary)", () => {
    it("길이 0으로 호출하면 빈 문자열을 반환한다", () => {
      const id = randomId(0)

      expect(id).toBe("")
    })

    it("길이 1로 호출하면 1자의 문자열을 반환한다", () => {
      const id = randomId(1)

      expect(id.length).toBe(1)
      expect(/^[a-z0-9]$/.test(id)).toBe(true)
    })

    it("매우 큰 길이로도 호출할 수 있다", () => {
      const largeLength = 10000
      const id = randomId(largeLength)

      expect(id.length).toBe(largeLength)
      expect(/^[a-z0-9]+$/.test(id)).toBe(true)
    })
  })

  describe("문자 집합 검증 (Conformance)", () => {
    it("오직 소문자 알파벳과 숫자만 포함한다", () => {
      for (let i = 0; i < 100; i++) {
        const id = randomId(50) // 충분히 긴 문자열로 테스트

        expect(/^[a-z0-9]+$/.test(id)).toBe(true)
        expect(/[A-Z]/.test(id)).toBe(false) // 대문자 없음
        expect(/[^a-z0-9]/.test(id)).toBe(false) // 특수문자 없음
      }
    })

    it("모든 허용된 문자가 생성될 수 있다", () => {
      const allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789"
      const foundChars = new Set<string>()

      // 충분히 많은 ID를 생성하여 모든 문자가 나타나는지 확인
      for (let i = 0; i < 10000; i++) {
        const id = randomId(10)
        for (const char of id) {
          foundChars.add(char)
        }
      }

      // 대부분의 허용된 문자가 발견되어야 함 (완전히 모든 문자는 보장할 수 없음)
      expect(foundChars.size).toBeGreaterThan(allowedChars.length * 0.8)
    })
  })

  describe("성능 테스트 (Performance)", () => {
    it("대량의 ID 생성이 빠르게 완료된다", () => {
      const idCount = 10000
      const startTime = performance.now()

      for (let i = 0; i < idCount; i++) {
        randomId()
      }

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(1000) // 1초 이하
    })

    it("긴 ID 생성도 빠르게 완료된다", () => {
      const longLength = 1000
      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        randomId(longLength)
      }

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(1000) // 1초 이하
    })
  })
})

describe("timestampId", () => {
  describe("기본 동작 (Right)", () => {
    it("overlay_ 접두사와 타임스탬프를 포함한 ID를 생성한다", () => {
      const id = timestampId()

      expect(typeof id).toBe("string")
      expect(id.startsWith("overlay_")).toBe(true)
      expect(/^overlay_\d+_[a-z0-9]{4}$/.test(id)).toBe(true)
    })

    it("매번 다른 ID를 생성한다", () => {
      const id1 = timestampId()
      // 최소한의 지연을 보장
      const id2 = timestampId()

      expect(id1).not.toBe(id2)
    })
  })

  describe("시간 기반 고유성 (Time)", () => {
    it("시간 순서대로 생성된 ID들이 순서를 유지한다", () => {
      const ids: string[] = []

      for (let i = 0; i < 10; i++) {
        ids.push(timestampId())
      }

      // 타임스탬프 부분 추출하여 비교
      const timestamps = ids.map((id) => {
        const match = id.match(/^overlay_(\d+)_/)
        return match ? parseInt(match[1], 10) : 0
      })

      // 타임스탬프가 비내림차순이어야 함 (같거나 증가)
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
      }
    })
  })

  describe("범위 검증 (Range)", () => {
    it("생성된 ID가 예상 길이 범위에 있다", () => {
      const id = timestampId()

      // "overlay_" (8) + 타임스탬프 (최소 13자) + "_" (1) + 랜덤 4자 = 최소 26자
      expect(id.length).toBeGreaterThanOrEqual(26)
      expect(id.length).toBeLessThan(50) // 합리적인 최대 길이
    })
  })
})

describe("uuidId", () => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  describe("기본 동작 (Right)", () => {
    it("UUID v4 형식의 문자열을 생성한다", () => {
      const id = uuidId()

      expect(typeof id).toBe("string")
      expect(uuidV4Regex.test(id)).toBe(true)
    })

    it("매번 다른 UUID를 생성한다", () => {
      const ids = new Set<string>()
      const idCount = 1000

      for (let i = 0; i < idCount; i++) {
        ids.add(uuidId())
      }

      // 모든 UUID가 고유해야 함
      expect(ids.size).toBe(idCount)
    })

    it("고정된 길이(36자)의 문자열을 생성한다", () => {
      const uuid = uuidId()

      expect(uuid.length).toBe(36)
    })
  })

  describe("UUID v4 사양 준수 (Conformance)", () => {
    it("버전 필드가 4로 설정된다", () => {
      for (let i = 0; i < 100; i++) {
        const uuid = uuidId()
        const versionChar = uuid[14]

        expect(versionChar).toBe("4")
      }
    })

    it("변형 필드가 올바르게 설정된다 (8, 9, a, or b)", () => {
      for (let i = 0; i < 100; i++) {
        const uuid = uuidId()
        const variantChar = uuid[19]

        expect(["8", "9", "a", "b"]).toContain(variantChar.toLowerCase())
      }
    })
  })

  describe("성능 테스트 (Performance)", () => {
    it("대량의 UUID 생성이 빠르게 완료된다", () => {
      const uuidCount = 10000
      const startTime = performance.now()

      for (let i = 0; i < uuidCount; i++) {
        uuidId()
      }

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(1000) // 1초 이하
    })
  })
})

describe("createUseExternalEvents 통합 테스트 (이미 다른 테스트에서 커버됨)", () => {
  const testNamespace = "utils-test"

  afterEach(() => {
    cleanupEmitter(testNamespace)
  })

  describe("빠른 검증 테스트 (Cross-check)", () => {
    it("External Events Hook과 생성기를 반환한다", () => {
      interface TestEvents {
        [key: string]: (...args: any[]) => void
        test: (message: string) => void
      }

      const [useExternalEvents, createEvent] = createUseExternalEvents<TestEvents>(testNamespace)

      expect(typeof useExternalEvents).toBe("function")
      expect(typeof createEvent).toBe("function")
    })

    it("Emitter 인스턴스 관리 기능이 작동한다", () => {
      interface TestEvents {
        [key: string]: (...args: any[]) => void
        test: () => void
      }

      const emitter1 = getEmitterInstance<TestEvents>(testNamespace)
      const emitter2 = getEmitterInstance<TestEvents>(testNamespace)

      expect(emitter1).toBe(emitter2) // 같은 네임스페이스는 같은 인스턴스

      expect(() => {
        cleanupEmitter(testNamespace)
        cleanupAllEmitters()
      }).not.toThrow()
    })
  })
})

describe("createEmitter 통합 테스트 (이미 다른 테스트에서 커버됨)", () => {
  describe("빠른 검증 테스트 (Cross-check)", () => {
    it("EventEmitter 인터페이스를 생성한다", () => {
      interface TestEvents {
        [key: string]: (...args: any[]) => void

        test: () => void
      }

      const emitter = createEmitter<TestEvents>("test-namespace")

      expect(emitter).toBeDefined()
      expect(typeof emitter.on).toBe("function")
      expect(typeof emitter.off).toBe("function")
      expect(typeof emitter.emit).toBe("function")
      expect(typeof emitter.removeAllListeners).toBe("function")
    })
  })
})

describe("통합 시나리오 테스트 (Integration)", () => {
  describe("ID 생성과 Context 통합", () => {
    it("생성된 ID가 Context에서 올바르게 사용된다", () => {
      const { OverlayContextProvider, useOverlayData } = createOverlaySafeContext()
      const id1 = randomId()
      const id2 = timestampId()
      const id3 = uuidId()

      const testData: OverlayData = {
        current: id1,
        overlayOrderList: [id1, id2, id3],
        overlayData: {
          [id1]: {
            id: id1,
            componentKey: randomId(),
            isOpen: true,
            isMounted: true,
            controller: () => null,
          },
          [id2]: {
            id: id2,
            componentKey: timestampId(),
            isOpen: false,
            isMounted: false,
            controller: () => null,
          },
          [id3]: {
            id: id3,
            componentKey: uuidId(),
            isOpen: true,
            isMounted: true,
            controller: () => null,
          },
        },
      }

      const TestComponent: React.FC = () => {
        const data = useOverlayData()
        return React.createElement("div", null, [
          React.createElement("div", { "data-testid": "current", key: "current" }, data.current),
          React.createElement(
            "div",
            { "data-testid": "count", key: "count" },
            Object.keys(data.overlayData).length.toString(),
          ),
          React.createElement("div", { "data-testid": "order", key: "order" }, data.overlayOrderList.join(",")),
        ])
      }

      render(
        // eslint-disable-next-line react/no-children-prop
        React.createElement(OverlayContextProvider, {
          value: testData,
          children: React.createElement(TestComponent), // 여기에 명시
        }),
      )
      // No children are passed as props; children are passed as additional arguments to React.createElement above.
      expect(screen.getByTestId("current")).toHaveTextContent(id1)
      expect(screen.getByTestId("count")).toHaveTextContent("3")
      expect(screen.getByTestId("order")).toHaveTextContent(`${id1},${id2},${id3}`)
    })
  })

  describe("ID 생성기와 이벤트 시스템 통합", () => {
    it("동적으로 생성된 네임스페이스로 이벤트 시스템이 작동한다", () => {
      interface TestEvents {
        [key: string]: (...args: any[]) => void

        dynamicEvent: (id: string) => void
      }

      const dynamicNamespace = `dynamic-${randomId()}`
      const emitter = createEmitter<TestEvents>(dynamicNamespace)
      const handler = vi.fn()

      emitter.on("dynamicEvent", handler)

      const testId = timestampId()
      emitter.emit("dynamicEvent", testId)

      expect(handler).toHaveBeenCalledWith(testId)

      // 생성된 네임스페이스 정리
      emitter.removeAllListeners()
    })
  })

  describe("모든 유틸리티 함수의 에러 저항성", () => {
    it("잘못된 입력에도 에러를 발생시키지 않는다", () => {
      expect(() => {
        // @ts-expect-error - 의도적인 잘못된 타입 테스트
        randomId("invalid")
        // @ts-expect-error - intentionally passing null to test error resistance
        randomId(null)
        randomId(undefined)
      }).not.toThrow()

      expect(() => {
        timestampId()
        uuidId()
      }).not.toThrow()

      expect(() => {
        createOverlaySafeContext()
      }).not.toThrow()
    })
  })
})
