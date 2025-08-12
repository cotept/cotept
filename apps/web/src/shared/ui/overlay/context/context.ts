/**
 * Overlay Context 정의
 * 타입 안전한 Context Provider와 Hook 제공
 */

import { createOverlaySafeContext } from '../utils/createSafeContext';

/**
 * 기본 Overlay Context 인스턴스 생성
 * 전역적으로 사용할 수 있는 Context 제공
 */
export const { 
  OverlayContextProvider, 
  useCurrentOverlay, 
  useOverlayData 
} = createOverlaySafeContext();