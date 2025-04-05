import { TokenPair } from "./token-pair.vo"

describe("TokenPair Value Object", () => {
  describe("create", () => {
    it("유효한 매개변수로 TokenPair 객체를 생성할 수 있어야 한다", () => {
      // Given
      const now = new Date()
      const params = {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        accessTokenExpiresAt: new Date(now.getTime() + 3600 * 1000), // 1시간 후
        refreshTokenExpiresAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000), // 7일 후
      }

      // When
      const tokenPair = TokenPair.create(params)

      // Then
      expect(tokenPair).toBeInstanceOf(TokenPair)
      expect(tokenPair.accessToken).toBe(params.accessToken)
      expect(tokenPair.refreshToken).toBe(params.refreshToken)
      expect(tokenPair.accessTokenExpiresAt).toBe(params.accessTokenExpiresAt)
      expect(tokenPair.refreshTokenExpiresAt).toBe(params.refreshTokenExpiresAt)
    })

    it("필수 필드가 누락되면 에러를 발생시켜야 한다", () => {
      // accessToken 누락
      expect(() => {
        TokenPair.create({
          accessToken: "",
          refreshToken: "refresh-token-456",
          accessTokenExpiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        })
      }).toThrow("액세스 토큰은 필수입니다.")

      // refreshToken 누락
      expect(() => {
        TokenPair.create({
          accessToken: "access-token-123",
          refreshToken: "",
          accessTokenExpiresAt: new Date(),
          refreshTokenExpiresAt: new Date(),
        })
      }).toThrow("리프레시 토큰은 필수입니다.")

      // accessTokenExpiresAt 누락
      expect(() => {
        TokenPair.create({
          accessToken: "access-token-123",
          refreshToken: "refresh-token-456",
          accessTokenExpiresAt: null as unknown as Date,
          refreshTokenExpiresAt: new Date(),
        })
      }).toThrow("액세스 토큰 만료 시간은 필수입니다.")

      // refreshTokenExpiresAt 누락
      expect(() => {
        TokenPair.create({
          accessToken: "access-token-123",
          refreshToken: "refresh-token-456",
          accessTokenExpiresAt: new Date(),
          refreshTokenExpiresAt: null as unknown as Date,
        })
      }).toThrow("리프레시 토큰 만료 시간은 필수입니다.")
    })
  })

  describe("toResponseDTO", () => {
    it("클라이언트 응답에 적합한 DTO 형식으로 변환해야 한다", () => {
      // Given
      const accessToken = "access-token-123"
      const refreshToken = "refresh-token-456"
      const now = Date.now()
      const accessTokenExpiresAt = new Date(now + 3600 * 1000) // 1시간 후

      const tokenPair = TokenPair.create({
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt: new Date(now + 7 * 24 * 3600 * 1000), // 7일 후
      })

      // When
      const responseDTO = tokenPair.toResponseDTO()

      // Then
      expect(responseDTO.accessToken).toBe(accessToken)
      expect(responseDTO.refreshToken).toBe(refreshToken)

      // expiresIn은 약 3600초(1시간)이지만, 테스트 실행 시간에 따라 약간 차이가 날 수 있음
      // 따라서 근사값으로 테스트
      expect(responseDTO.expiresIn).toBeGreaterThan(3500)
      expect(responseDTO.expiresIn).toBeLessThanOrEqual(3600)
    })

    it("이미 만료된 토큰의 경우 expiresIn을 0으로 반환해야 한다", () => {
      // Given
      const tokenPair = TokenPair.create({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        accessTokenExpiresAt: new Date(Date.now() - 1000), // 1초 전 만료
        refreshTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
      })

      // When
      const responseDTO = tokenPair.toResponseDTO()

      // Then
      expect(responseDTO.expiresIn).toBe(0)
    })
  })

  describe("isAccessTokenExpired / isRefreshTokenExpired", () => {
    it("현재 시간이 만료 시간 이후면 true를 반환해야 한다", () => {
      // Given
      const now = Date.now()
      const tokenPair = TokenPair.create({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        accessTokenExpiresAt: new Date(now - 1000), // 1초 전
        refreshTokenExpiresAt: new Date(now - 2000), // 2초 전
      })

      // When & Then
      expect(tokenPair.isAccessTokenExpired()).toBe(true)
      expect(tokenPair.isRefreshTokenExpired()).toBe(true)
    })

    it("현재 시간이 만료 시간 이전이면 false를 반환해야 한다", () => {
      // Given
      const now = Date.now()
      const tokenPair = TokenPair.create({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        accessTokenExpiresAt: new Date(now + 3600 * 1000), // 1시간 후
        refreshTokenExpiresAt: new Date(now + 7 * 24 * 3600 * 1000), // 7일 후
      })

      // When & Then
      expect(tokenPair.isAccessTokenExpired()).toBe(false)
      expect(tokenPair.isRefreshTokenExpired()).toBe(false)
    })
  })
})
