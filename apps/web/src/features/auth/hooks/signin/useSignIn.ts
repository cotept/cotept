"use client"
import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { signInAction } from "@/features/auth/actions/signin"
import { LoginData, LoginRules } from "@/features/auth/lib/validations/auth-rules"
import { createClearInputField } from "@/shared/utils"

const isValidId = (id: string) => LoginRules.pick({ id: true }).safeParse({ id }).success
const isValidPassword = (password: string) => LoginRules.pick({ password: true }).safeParse({ password }).success

export function useSignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showPasswordField, setShowPasswordField] = useState<boolean>(false)

  const form = useForm<LoginData>({
    resolver: zodResolver(LoginRules),
    defaultValues: {
      id: "",
      password: "",
    },
  })

  const { errors, isValid, isLoading, isSubmitting } = form.formState

  const id = form.watch("id")
  const password = form.watch("password")

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
      }
      // 성공 시에는 서버 액션에서 자동으로 리다이렉트됨
    } catch (error) {
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

  const handleShowPasswordField = () => {
    setShowPasswordField(true)
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

    showPasswordField,
    handleShowPasswordField,

    clearIdField,
    clearPasswordField,
  }
}
