"use client"
import { useState } from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { signInAction } from "@/features/auth/actions/signin"
import { LoginData, LoginRules } from "@/features/auth/lib/validations/auth-rules"
import { createClearInputField } from "@/shared/utils"

const isValidId = (id: string) => LoginRules.pick({ id: true }).safeParse({ id }).success
const isValidPassword = (password: string) => LoginRules.pick({ password: true }).safeParse({ password }).success

interface UseSignInProps {
  onSuccess?: () => void
}

export function useSignIn(props?: UseSignInProps) {
  const router = useRouter()
  const { update } = useSession()
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const form = useForm<LoginData>({
    resolver: zodResolver(LoginRules),
    defaultValues: {
      id: "",
      password: "",
    },
  })

  const { errors, isValid, isLoading, isSubmitting } = form.formState

  const id = useWatch({ control: form.control, name: "id", defaultValue: "" })
  const password = useWatch({ control: form.control, name: "password", defaultValue: "" })

  const isIdValid = isValidId(id)
  const isPasswordValid = isValidPassword(password)

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!isValid) return

    try {
      const formData = new FormData()
      formData.append("id", data.id)
      formData.append("password", data.password)
      const result = await signInAction(formData)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      // 로그인 성공: 온보딩 상태 동기화 트리거와 함께 세션 갱신 후 리다이렉트
      if (result?.success) {
        toast.success("로그인되었습니다.")
        await update({ trigger: "ONBOARDING_UPDATE" })
        router.push(result.redirectTo)
      }
    } catch (error) {
      toast.error("로그인 중 문제가 발생했습니다.")
      console.error("로그인 오류:", error)
    }
  })

  const clearError = () => {
    form.clearErrors("id")
    form.clearErrors("password")
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const clearInputField = createClearInputField(form)
  const clearIdField = () => clearInputField("id")
  const clearPasswordField = () => clearInputField("password")
  return {
    form,
    id,
    password,
    handleSubmit,
    errors,
    isLoading: isLoading || isSubmitting,
    showPassword,
    togglePasswordVisibility,
    clearError,

    isIdValid,
    isPasswordValid,

    clearIdField,
    clearPasswordField,
  }
}
