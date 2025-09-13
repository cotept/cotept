import { z } from "zod"

import { FieldRules } from "@/shared/lib/validations/field-rules"

/**
 * 로그인 유효성 검사 스키마
 */
export const LoginSchema = z.object({
  id: FieldRules.userId(),
  password: FieldRules.password(),
})

export type LoginData = z.infer<typeof LoginSchema>

/**
 * 로그인 폼 기본값
 */
export const defaultLoginValues: LoginData = {
  id: "",
  password: "",
}
