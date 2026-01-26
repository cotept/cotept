import { UserRole } from "@repo/api-client"

import { beforeEach, describe, expect, it } from "vitest"

import { TokenRefreshStrategy } from "../token-refresh.strategy"
import { SessionUpdateContext } from "../update-strategy.interface"

describe("TokenRefreshStrategy", () => {
  let strategy: TokenRefreshStrategy

  beforeEach(() => {
    strategy = new TokenRefreshStrategy()
  })

  describe("isApplicable", () => {
    // Right: 기본 기능 검증
    describe("기본 기능 (Right)", () => {
      it("trigger가 'update'이고 session.trigger가 'TOKEN_REFRESH'일 때 true를 반환한다", () => {
        // Given
        const context: SessionUpdateContext = {
          token: { accessToken: "old-token" },
          trigger: "update",
          session: { trigger: "TOKEN_REFRESH" },
        }

        // When
        const result = strategy.isApplicable(context)

        // Then
        expect(result).toBe(true)
      })
    })

    // Inverse: 반대 케이스
    describe("반대 조건 (Inverse)", () => {
      it("trigger가 'signIn'일 때 false를 반환한다", () => {
        // Given
        const context: SessionUpdateContext = {
          token: { accessToken: "old-token" },
          trigger: "signIn",
          session: { trigger: "TOKEN_REFRESH" },
        }

        // When
        const result = strategy.isApplicable(context)

        // Then
        expect(result).toBe(false)
      })

      it("session.trigger가 'ONBOARDING_UPDATE'일 때 false를 반환한다", () => {
        // Given
        const context: SessionUpdateContext = {
          token: { accessToken: "old-token" },
          trigger: "update",
          session: { trigger: "ONBOARDING_UPDATE" },
        }

        // When
        const result = strategy.isApplicable(context)

        // Then
        expect(result).toBe(false)
      })

      it("session.trigger가 없을 때 false를 반환한다", () => {
        // Given
        const context: SessionUpdateContext = {
          token: { accessToken: "old-token" },
          trigger: "update",
          session: {},
        }

        // When
        const result = strategy.isApplicable(context)

        // Then
        expect(result).toBe(false)
      })
    })
  })

  describe("execute", () => {
    // Right: 기본 기능 검증
    describe("기본 기능 (Right)", () => {
      it("session의 accessToken과 refreshToken을 token에 복사한다", async () => {
        // Given
        const context: SessionUpdateContext = {
          token: {
            accessToken: "old-access-token",
            refreshToken: "old-refresh-token",
          },
          trigger: "update",
          session: {
            trigger: "TOKEN_REFRESH",
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
        }

        // When
        const result = await strategy.execute(context)

        // Then
        expect(result.accessToken).toBe("new-access-token")
        expect(result.refreshToken).toBe("new-refresh-token")
      })

      it("기존 token의 다른 필드는 유지된다", async () => {
        // Given
        const mockMember = {
          idx: 1,
          userId: "test-user",
          email: "test@test.com",
          role: UserRole.MENTEE,
          tokenType: "Bearer",
          expiresIn: 3600,
        }
        const context: SessionUpdateContext = {
          token: {
            accessToken: "old-access-token",
            refreshToken: "old-refresh-token",
            member: mockMember,
          },
          trigger: "update",
          session: {
            trigger: "TOKEN_REFRESH",
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
          },
        }

        // When
        const result = await strategy.execute(context)

        // Then
        expect(result.member).toEqual(mockMember)
      })
    })

    // Boundary: 경계 조건
    describe("경계 조건 (Boundary)", () => {
      it("session에 accessToken만 있을 때 accessToken만 업데이트한다", async () => {
        // Given
        const context: SessionUpdateContext = {
          token: {
            accessToken: "old-access-token",
            refreshToken: "old-refresh-token",
          },
          trigger: "update",
          session: {
            trigger: "TOKEN_REFRESH",
            accessToken: "new-access-token",
          },
        }

        // When
        const result = await strategy.execute(context)

        // Then
        expect(result.accessToken).toBe("new-access-token")
        expect(result.refreshToken).toBe("old-refresh-token")
      })

      it("session에 refreshToken만 있을 때 refreshToken만 업데이트한다", async () => {
        // Given
        const context: SessionUpdateContext = {
          token: {
            accessToken: "old-access-token",
            refreshToken: "old-refresh-token",
          },
          trigger: "update",
          session: {
            trigger: "TOKEN_REFRESH",
            refreshToken: "new-refresh-token",
          },
        }

        // When
        const result = await strategy.execute(context)

        // Then
        expect(result.accessToken).toBe("old-access-token")
        expect(result.refreshToken).toBe("new-refresh-token")
      })

      it("session에 토큰이 없을 때 기존 토큰을 유지한다", async () => {
        // Given
        const context: SessionUpdateContext = {
          token: {
            accessToken: "old-access-token",
            refreshToken: "old-refresh-token",
          },
          trigger: "update",
          session: {
            trigger: "TOKEN_REFRESH",
          },
        }

        // When
        const result = await strategy.execute(context)

        // Then
        expect(result.accessToken).toBe("old-access-token")
        expect(result.refreshToken).toBe("old-refresh-token")
      })
    })
  })
})
