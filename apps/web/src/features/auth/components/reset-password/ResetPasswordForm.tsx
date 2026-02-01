"use client"

import React, { useState } from "react"

import Link from "next/link"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"
import { ValidationIndicator } from "@repo/shared/src/components/validation-indicator"

import { CheckCircle2, ChevronLeft, Eye, EyeOff, Mail } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { useResetPassword } from "../../hooks/reset-password/useResetPassword"

import { formatTimeMMSS } from "@/shared/utils"

export function ResetPasswordForm() {
  const {
    step,
    cooldownTime,
    form,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    goBack,
    isSendingCode,
    isResetting,
    canResend,
    passwordChecks,
    isPasswordValid,
    isPasswordMatch,
    newPassword,
  } = useResetPassword()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <Form {...form}>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: 이메일 입력 */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6">
              <div className="space-y-4">
                <div className="bg-bg-2 border-border flex items-center gap-4 rounded-xl border p-4">
                  <div className="bg-primary rounded-full p-2 text-white">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-fg-1 font-bold">이메일로 인증</p>
                    <p className="text-fg-3 text-xs">가입 시 등록한 이메일로 인증 코드를 받습니다.</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-fg-2">이메일 주소</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="example@email.com" className="h-12" autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleSendCode}
                  variant="auth-primary"
                  size="xl"
                  className="w-full font-bold"
                  disabled={isSendingCode}>
                  {isSendingCode ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>발송 중...</span>
                    </div>
                  ) : (
                    "인증 코드 받기"
                  )}
                </Button>
                <Button asChild variant="ghost" className="text-fg-3 hover:text-fg-1">
                  <Link href="/auth/signin">
                    <ChevronLeft size={16} className="mr-1" />
                    로그인으로 돌아가기
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: 인증 코드 입력 */}
          {step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6">
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-fg-2">인증 코드</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          maxLength={6}
                          placeholder="인증 코드 6자리"
                          className="h-12 pr-16 text-lg tracking-widest"
                          autoFocus
                        />
                        {cooldownTime > 0 && (
                          <div className="text-primary absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm">
                            {formatTimeMMSS(cooldownTime)}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleVerifyCode}
                  variant="auth-primary"
                  size="xl"
                  className="w-full font-bold"
                  disabled={form.watch("verificationCode").length !== 6}>
                  확인
                </Button>

                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-fg-3 hover:text-fg-1 flex items-center text-sm">
                    <ChevronLeft size={16} className="mr-1" />
                    이전으로
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend || isSendingCode}
                    className="text-primary disabled:text-fg-3 text-sm font-medium hover:underline">
                    인증 코드 다시 받기
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: 새 비밀번호 입력 */}
          {step === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-fg-2">새 비밀번호</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="새 비밀번호 입력"
                            className="h-12 pr-12"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-fg-3 hover:text-fg-1 absolute right-3 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 비밀번호 유효성 검사 표시 */}
                {newPassword.length > 0 && (
                  <ValidationIndicator checks={passwordChecks} layout="inline" showWhen="always" inputValue={newPassword} isDirty />
                )}

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-fg-2">비밀번호 확인</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="비밀번호 다시 입력"
                            className="h-12 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-fg-3 hover:text-fg-1 absolute right-3 top-1/2 -translate-y-1/2">
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {isPasswordMatch && (
                        <p className="text-success flex items-center gap-1 text-sm">
                          <CheckCircle2 size={14} />
                          비밀번호가 일치합니다.
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleResetPassword}
                  variant="auth-primary"
                  size="xl"
                  className="w-full font-bold"
                  disabled={!isPasswordValid || !isPasswordMatch || isResetting}>
                  {isResetting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>변경 중...</span>
                    </div>
                  ) : (
                    "비밀번호 변경하기"
                  )}
                </Button>

                <button type="button" onClick={goBack} className="text-fg-3 hover:text-fg-1 flex items-center text-sm">
                  <ChevronLeft size={16} className="mr-1" />
                  이전으로
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: 완료 */}
          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8">
              <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                <div className="bg-success/10 text-success rounded-full p-3">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-fg-1 text-xl font-bold">비밀번호가 변경되었습니다</h3>
                  <p className="text-fg-3 mt-1 text-sm">새 비밀번호로 로그인해주세요.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <Button asChild variant="auth-primary" size="xl" className="w-full font-bold">
                  <Link href="/auth/signin">로그인하러 가기</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Form>
  )
}
