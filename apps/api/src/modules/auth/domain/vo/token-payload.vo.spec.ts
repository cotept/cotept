import { TokenPayload } from "./token-payload.vo"

describe("TokenPayload Value Object", () => {
  describe("create", () => {
    it("유효한 매개변수로 TokenPayload 객체를 생성할 수 있어야 한다", () => {
      // Given
      const params = {
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "ACCESS" as const,
      }

      // When
      const payload = TokenPayload.create(params)

      // Then
      expect(payload).toBeInstanceOf(TokenPayload)
      expect(payload.userId).toBe(params.userId)
      expect(payload.email).toBe(params.email)
      expect(payload.role).toBe(params.role)
      expect(payload.tokenType).toBe(params.tokenType)
      expect(payload.issuedAt).toBeInstanceOf(Date)
    })

    it("필수 필드가 누락되면 에러를 발생시켜야 한다", () => {
      // userId 누락
      expect(() => {
        TokenPayload.create({
          userId: "",
          email: "test@example.com",
          role: "MENTEE",
          tokenType: "ACCESS" as const,
        })
      }).toThrow("사용자 ID는 필수입니다.")

      // email 누락
      expect(() => {
        TokenPayload.create({
          userId: "user-123",
          email: "",
          role: "MENTEE",
          tokenType: "ACCESS" as const,
        })
      }).toThrow("이메일은 필수입니다.")

      // role 누락
      expect(() => {
        TokenPayload.create({
          userId: "user-123",
          email: "test@example.com",
          role: "",
          tokenType: "ACCESS" as const,
        })
      }).toThrow("역할은 필수입니다.")

      // tokenType 누락
      expect(() => {
        TokenPayload.create({
          userId: "user-123",
          email: "test@example.com",
          role: "MENTEE",
          tokenType: null as any,
        })
      }).toThrow("토큰 타입은 필수입니다.")
    })

    it("선택적 매개변수가 제공되면 토큰 페이로드에 포함되어야 한다", () => {
      // Given
      const familyId = "family-456"
      const expiresAt = new Date(Date.now() + 3600000) // 1시간 후

      // When
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "REFRESH",
        familyId,
        expiresAt,
      })

      // Then
      expect(payload.familyId).toBe(familyId)
      expect(payload.expiresAt).toBe(expiresAt)
    })
  })

  describe("toJwtClaims", () => {
    it("표준 JWT 클레임 형식으로 변환해야 한다", () => {
      // Given
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 3600000) // 1시간 후

      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTOR",
        tokenType: "ACCESS",
        familyId: "family-456",
        issuedAt: now,
        expiresAt,
      })

      // When
      const claims = payload.toJwtClaims()

      // Then
      expect(claims.sub).toBe("user-123")
      expect(claims.email).toBe("test@example.com")
      expect(claims.role).toBe("MENTOR")
      expect(claims.type).toBe("ACCESS")
      expect(claims.fid).toBe("family-456")
      expect(claims.iat).toBe(Math.floor(now.getTime() / 1000))
      expect(claims.exp).toBe(Math.floor(expiresAt.getTime() / 1000))
    })

    it("선택적 필드가 없는 경우 해당 클레임을 생략해야 한다", () => {
      // Given
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "ADMIN",
        tokenType: "ACCESS",
      })

      // When
      const claims = payload.toJwtClaims()

      // Then
      expect(claims.fid).toBeUndefined()
      expect(claims.exp).toBeUndefined()
      expect(claims.iat).toBeDefined() // issuedAt은 항상 기본값이 있음
    })
  })

  describe("fromJwtClaims", () => {
    it("JWT 클레임에서 TokenPayload 객체를 복원할 수 있어야 한다", () => {
      // Given
      const now = Math.floor(Date.now() / 1000)
      const exp = now + 3600 // 1시간 후

      const claims = {
        sub: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        type: "ACCESS",
        fid: "family-456",
        iat: now,
        exp,
      }

      // When
      const payload = TokenPayload.fromJwtClaims(claims)

      // Then
      expect(payload.userId).toBe("user-123")
      expect(payload.email).toBe("test@example.com")
      expect(payload.role).toBe("MENTEE")
      expect(payload.tokenType).toBe("ACCESS")
      expect(payload.familyId).toBe("family-456")
      expect(payload.issuedAt?.getTime()).toBe(now * 1000)
      expect(payload.expiresAt?.getTime()).toBe(exp * 1000)
    })

    it("필수 클레임이 누락되면 에러를 발생시켜야 한다", () => {
      // Given
      const invalidClaims = {
        email: "test@example.com",
        role: "MENTEE",
        type: "ACCESS",
        // sub 누락
      }

      // When & Then
      expect(() => {
        TokenPayload.fromJwtClaims(invalidClaims)
      }).toThrow("유효하지 않은 토큰 클레임입니다.")
    })
  })

  describe("isExpired", () => {
    it("현재 시간이 만료 시간 이후면 true를 반환해야 한다", () => {
      // Given
      const expiredDate = new Date(Date.now() - 1000) // 1초 전
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "ACCESS",
        expiresAt: expiredDate,
      })

      // When & Then
      expect(payload.isExpired()).toBe(true)
    })

    it("현재 시간이 만료 시간 이전이면 false를 반환해야 한다", () => {
      // Given
      const futureDate = new Date(Date.now() + 3600000) // 1시간 후
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "ACCESS",
        expiresAt: futureDate,
      })

      // When & Then
      expect(payload.isExpired()).toBe(false)
    })

    it("만료 시간이 설정되지 않으면 false를 반환해야 한다", () => {
      // Given
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "ACCESS",
      })

      // When & Then
      expect(payload.isExpired()).toBe(false)
    })
  })

  describe("withExpiresAt / withNewFamilyId", () => {
    it("새로운 만료 시간을 가진 페이로드를 반환해야 한다", () => {
      // Given
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "ACCESS",
      })

      const newExpiresAt = new Date(Date.now() + 7200000) // 2시간 후

      // When
      const newPayload = payload.withExpiresAt(newExpiresAt)

      // Then
      expect(newPayload).not.toBe(payload) // 새 객체
      expect(newPayload.expiresAt).toBe(newExpiresAt)
      expect(newPayload.userId).toBe(payload.userId) // 다른 속성은 유지
      expect(newPayload.email).toBe(payload.email)
      expect(newPayload.role).toBe(payload.role)
    })

    it("새로운 패밀리 ID를 가진 페이로드를 반환해야 한다", () => {
      // Given
      const payload = TokenPayload.create({
        userId: "user-123",
        email: "test@example.com",
        role: "MENTEE",
        tokenType: "REFRESH",
        familyId: "old-family",
      })

      const newFamilyId = "new-family"

      // When
      const newPayload = payload.withNewFamilyId(newFamilyId)

      // Then
      expect(newPayload).not.toBe(payload) // 새 객체
      expect(newPayload.familyId).toBe(newFamilyId)
      expect(newPayload.userId).toBe(payload.userId) // 다른 속성은 유지
      expect(newPayload.role).toBe(payload.role)
      expect(newPayload.tokenType).toBe(payload.tokenType)
      expect(newPayload.issuedAt).not.toBe(payload.issuedAt) // 발급 시간은 업데이트됨
    })
  })
})
