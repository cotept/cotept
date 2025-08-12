/**
 * 기본 Overlay 인스턴스 생성
 * 전역적으로 사용할 수 있는 overlay API와 Provider 제공
 */

import { createOverlayProvider } from "./provider/createOverlayProvider"

/**
 * 기본 overlay 인스턴스 생성
 * 애플리케이션 전역에서 사용할 수 있는 싱글턴 스타일 API
 *
 * @description overlay-kit의 Factory 패턴을 활용하되,
 * CotePT에서는 기본적으로 하나의 전역 인스턴스를 사용
 */
const { overlay, OverlayProvider: DefaultOverlayProvider, useCurrentOverlay, useOverlayData } = createOverlayProvider()

// Export 통합 (중복 방지)
export { DefaultOverlayProvider, overlay, useCurrentOverlay, useOverlayData }
