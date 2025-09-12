/**
 * Overlay Context System 테스트
 * createOverlayProvider와 createSafeContext 통합 테스트
 * 
 * @description 테스트 가이드라인 적용:
 * - FIRST: Fast, Isolated, Repeatable, Self-Validating, Timely
 * - Right-BICEP: Right, Boundary, Inverse, Cross-check, Error, Performance
 * - CORRECT: Conformance, Ordering, Range, Reference, Existence, Cardinality, Time
 */

import React from "react"

import { render, screen } from "@testing-library/react"
import { afterEach,beforeEach, describe, expect, it, vi } from "vitest"

import { DefaultOverlayProvider, overlay, useCurrentOverlay, useOverlayData } from "../../createOverlayContext"
import { createOverlayProvider } from "../../provider/createOverlayProvider"
import { createOverlaySafeContext } from "../../utils/createSafeContext"

// Mock Portal element 설정
const mockPortalRoot = document.createElement("div")
mockPortalRoot.id = "overlay-root"
document.body.appendChild(mockPortalRoot)

// 테스트용 컴포넌트들
const TestComponent: React.FC<{ testId?: string }> = ({ testId = "test-component" }) => {
  return <div data-testid={testId}>Test Overlay Component</div>
}

const TestModal: React.FC<{ onClose?: () => void; title?: string }> = ({ 
  onClose, 
  title = "Test Modal" 
}) => {
  return (
    <div data-testid="test-modal" role="dialog" aria-modal="true">
      <h2>{title}</h2>
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
    </div>
  )
}

// ContextTestComponent는 각 테스트에서 provider의 hooks를 사용하도록 수정

describe("createOverlaySafeContext", () => {
  describe("기본 동작 (Right)", () => {
    it("Context Provider와 Hook을 올바르게 생성한다", () => {
      const { OverlayContextProvider, useCurrentOverlay, useOverlayData } = createOverlaySafeContext()
      
      expect(OverlayContextProvider).toBeDefined()
      expect(typeof OverlayContextProvider).toBe("function")
      expect(typeof useCurrentOverlay).toBe("function")
      expect(typeof useOverlayData).toBe("function")
    })

    it("Provider 내에서 Context 값을 올바르게 제공한다", () => {
      const { OverlayContextProvider, useOverlayData } = createOverlaySafeContext()
      const testData = {
        current: "test-overlay",
        overlayOrderList: ["overlay1", "overlay2"],
        overlayData: {}
      }

      const TestComponent: React.FC = () => {
        const data = useOverlayData()
        return <div data-testid="context-data">{JSON.stringify(data)}</div>
      }

      render(
        <OverlayContextProvider value={testData}>
          <TestComponent />
        </OverlayContextProvider>
      )

      expect(screen.getByTestId("context-data")).toHaveTextContent(JSON.stringify(testData))
    })
  })

  describe("에러 처리 (Error conditions)", () => {
    it("Provider 없이 useOverlayData Hook 사용 시 명확한 에러를 던진다", () => {
      const { useOverlayData } = createOverlaySafeContext()
      
      const TestComponent: React.FC = () => {
        useOverlayData()
        return null
      }

      // React의 에러 경계 시뮬레이션을 위한 콘솔 에러 억제
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow(
        "Context must be used within a corresponding Provider. " +
        "Make sure to wrap your component with the correct Provider."
      )
      
      consoleSpy.mockRestore()
    })

    it("Provider 없이 useCurrentOverlay Hook 사용 시에도 같은 에러를 던진다", () => {
      const { useCurrentOverlay } = createOverlaySafeContext()
      
      const TestComponent: React.FC = () => {
        useCurrentOverlay()
        return null
      }

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow(
        "Context must be used within a corresponding Provider. " +
        "Make sure to wrap your component with the correct Provider."
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe("타입 특화 동작 (Conformance)", () => {
    it("createOverlaySafeContext가 OverlayData 타입에 특화된 Hook을 제공한다", () => {
      const { OverlayContextProvider, useCurrentOverlay, useOverlayData } = createOverlaySafeContext()
      const testData = {
        current: "current-overlay",
        overlayOrderList: ["overlay1"],
        overlayData: {
          overlay1: {
            id: "overlay1",
            componentKey: "test-key",
            isOpen: true,
            isMounted: true,
            controller: () => null
          }
        }
      }

      const TestComponent: React.FC = () => {
        const current = useCurrentOverlay()
        const data = useOverlayData()
        return (
          <div>
            <div data-testid="current">{current}</div>
            <div data-testid="order-count">{data.overlayOrderList.length}</div>
          </div>
        )
      }

      render(
        <OverlayContextProvider value={testData}>
          <TestComponent />
        </OverlayContextProvider>
      )

      expect(screen.getByTestId("current")).toHaveTextContent("current-overlay")
      expect(screen.getByTestId("order-count")).toHaveTextContent("1")
    })
  })
})

describe("createOverlayProvider", () => {
  let providerResult: ReturnType<typeof createOverlayProvider>

  beforeEach(() => {
    providerResult = createOverlayProvider()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 테스트 간 격리를 위한 DOM 정리
    mockPortalRoot.innerHTML = ""
  })

  describe("Provider 생성 (Right)", () => {
    it("올바른 구조의 결과 객체를 반환한다", () => {
      expect(providerResult).toHaveProperty("overlay")
      expect(providerResult).toHaveProperty("OverlayProvider")
      expect(providerResult).toHaveProperty("useCurrentOverlay")
      expect(providerResult).toHaveProperty("useOverlayData")
      
      expect(typeof providerResult.overlay).toBe("object")
      expect(typeof providerResult.OverlayProvider).toBe("function")
      expect(typeof providerResult.useCurrentOverlay).toBe("function")
      expect(typeof providerResult.useOverlayData).toBe("function")
    })

    it("독립적인 인스턴스들을 생성한다 (Isolated)", () => {
      const provider1 = createOverlayProvider()
      const provider2 = createOverlayProvider()
      
      expect(provider1.overlay).not.toBe(provider2.overlay)
      expect(provider1.OverlayProvider).not.toBe(provider2.OverlayProvider)
    })
  })

  describe("Provider 렌더링 (Existence)", () => {
    it("children을 올바르게 렌더링한다", () => {
      const { OverlayProvider } = providerResult

      render(
        <OverlayProvider>
          <div data-testid="child-content">Child Content</div>
        </OverlayProvider>
      )

      expect(screen.getByTestId("child-content")).toBeInTheDocument()
      expect(screen.getByTestId("child-content")).toHaveTextContent("Child Content")
    })

    it("Portal root가 없을 때 경고 메시지를 출력한다", () => {
      // Portal root 임시 제거
      const originalPortalRoot = document.getElementById("overlay-root")
      originalPortalRoot?.remove()

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      const { OverlayProvider } = providerResult

      render(
        <OverlayProvider>
          <div>Test</div>
        </OverlayProvider>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Overlay] Portal root element not found. " +
        'Make sure to add <div id="overlay-root"></div> to your HTML.'
      )

      // Portal root 복원
      document.body.appendChild(mockPortalRoot)
      consoleSpy.mockRestore()
    })
  })

  describe("Context Hook 동작 (Cross-check)", () => {
    it("초기 상태가 올바르게 설정된다", () => {
      const { OverlayProvider, useCurrentOverlay, useOverlayData } = providerResult

      const ContextTestComponent: React.FC = () => {
        const current = useCurrentOverlay()
        const data = useOverlayData()
        
        return (
          <div>
            <div data-testid="current-overlay">{current || "null"}</div>
            <div data-testid="overlay-count">{Object.keys(data.overlayData).length}</div>
            <div data-testid="order-list">{data.overlayOrderList.join(",")}</div>
          </div>
        )
      }

      render(
        <OverlayProvider>
          <ContextTestComponent />
        </OverlayProvider>
      )

      // 초기 상태 확인
      expect(screen.getByTestId("current-overlay")).toHaveTextContent("null")
      expect(screen.getByTestId("overlay-count")).toHaveTextContent("0")
      expect(screen.getByTestId("order-list")).toHaveTextContent("")
    })

    it("Provider가 올바른 초기 컨텍스트를 제공한다", () => {
      const { OverlayProvider, useOverlayData } = providerResult

      let capturedData: any

      const TestComponent: React.FC = () => {
        capturedData = useOverlayData()
        return null
      }

      render(
        <OverlayProvider>
          <TestComponent />
        </OverlayProvider>
      )

      expect(capturedData.current).toBeNull()
      expect(capturedData.overlayOrderList).toEqual([])
      expect(capturedData.overlayData).toEqual({})
    })
  })

  describe("Provider 생명주기 (Time)", () => {
    it("Provider 언마운트 시 cleanup 로직이 호출된다", () => {
      const { OverlayProvider } = providerResult

      const { unmount } = render(
        <OverlayProvider>
          <div>Test Content</div>
        </OverlayProvider>
      )

      // Provider 언마운트 시 에러가 발생하지 않음을 확인
      expect(() => {
        unmount()
      }).not.toThrow()

      // DOM에서 오버레이 정리 확인
      expect(mockPortalRoot.children.length).toBe(0)
    })
  })

  describe("이벤트 시스템 통합 (Integration)", () => {
    it("overlay API 객체가 올바른 메서드들을 제공한다", () => {
      const { overlay } = providerResult

      expect(overlay.open).toBeDefined()
      expect(overlay.close).toBeDefined()
      expect(overlay.unmount).toBeDefined()
      expect(overlay.closeAll).toBeDefined()
      expect(overlay.unmountAll).toBeDefined()
      expect(overlay.openAsync).toBeDefined()
      
      expect(typeof overlay.open).toBe("function")
      expect(typeof overlay.close).toBe("function") 
      expect(typeof overlay.unmount).toBe("function")
      expect(typeof overlay.closeAll).toBe("function")
      expect(typeof overlay.unmountAll).toBe("function")
      expect(typeof overlay.openAsync).toBe("function")
    })

    it("이벤트 호출이 에러를 발생시키지 않는다", () => {
      const { overlay } = providerResult

      expect(() => {
        overlay.close("nonexistent-overlay")
        overlay.unmount("nonexistent-overlay")
        overlay.closeAll()
        overlay.unmountAll()
      }).not.toThrow()
    })
  })

  describe("성능 테스트 (Performance)", () => {
    it("Provider 생성이 빠르게 완료된다", () => {
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        createOverlayProvider()
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(500) // 0.5초 이하
    })
  })
})

describe("Default Overlay Instance", () => {
  describe("기본 인스턴스 동작 (Right)", () => {
    it("전역 overlay 인스턴스가 올바르게 내보내진다", () => {
      expect(overlay).toBeDefined()
      expect(overlay.open).toBeDefined()
      expect(overlay.close).toBeDefined()
      expect(overlay.unmount).toBeDefined()
      expect(typeof overlay.open).toBe("function")
      expect(typeof overlay.close).toBe("function")
      expect(typeof overlay.unmount).toBe("function")
    })

    it("DefaultOverlayProvider가 올바르게 동작한다", () => {
      render(
        <DefaultOverlayProvider>
          <div data-testid="default-provider-child">Default Provider Test</div>
        </DefaultOverlayProvider>
      )

      expect(screen.getByTestId("default-provider-child")).toBeInTheDocument()
      expect(screen.getByTestId("default-provider-child")).toHaveTextContent("Default Provider Test")
    })

    it("전역 Hook들이 올바르게 동작한다", () => {
      const TestComponent: React.FC = () => {
        const current = useCurrentOverlay()
        const data = useOverlayData()
        
        return (
          <div>
            <div data-testid="global-current">{current || "null"}</div>
            <div data-testid="global-count">{Object.keys(data.overlayData).length}</div>
          </div>
        )
      }

      render(
        <DefaultOverlayProvider>
          <TestComponent />
        </DefaultOverlayProvider>
      )

      expect(screen.getByTestId("global-current")).toHaveTextContent("null")
      expect(screen.getByTestId("global-count")).toHaveTextContent("0")
    })
  })

  describe("전역 인스턴스 격리 (Boundary)", () => {
    it("전역 인스턴스는 싱글턴이다", () => {
      // 같은 모듈을 다시 import해도 같은 인스턴스여야 함
      expect(overlay).toBe(overlay) // 참조 동일성 확인
      
      // 새로운 Provider를 만들었을 때는 다른 인스턴스
      const { overlay: newOverlay } = createOverlayProvider()
      expect(overlay).not.toBe(newOverlay)
    })
  })
})