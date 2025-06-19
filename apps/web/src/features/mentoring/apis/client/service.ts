import { BaseApiService } from "@/shared/api/core/base-api-service"
import { User, CreateUserRequest, UpdateUserRequest } from "@/shared/api/core/types"

export class UserService extends BaseApiService {
  constructor() {
    super("/users")
  }

  // 사용자 목록 조회
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    return this.getList<User>("", { query: params })
  }

  // 사용자 상세 조회
  async getUser(id: string) {
    return this.get<User>(":id", { params: { id } })
  }

  // 현재 사용자 프로필 조회
  async getProfile() {
    return this.get<User>("profile")
  }

  // 사용자 생성
  async createUser(data: CreateUserRequest) {
    return this.post<CreateUserRequest, User>("", { body: data })
  }

  // 사용자 정보 수정
  async updateUser(id: string, data: UpdateUserRequest) {
    return this.put<UpdateUserRequest, User>(":id", {
      params: { id },
      body: data,
    })
  }

  // 사용자 삭제
  async deleteUser(id: string) {
    return this.delete(":id", { params: { id } })
  }
}

export const userService = new UserService()
