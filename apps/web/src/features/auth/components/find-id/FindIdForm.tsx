"use client"

import React from "react"

import Link from "next/link"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"

import { CheckCircle2, ChevronLeft, Mail } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { useFindId } from "../../hooks/find-id/useFindId"

import { formatTimeMMSS } from "@/shared/utils"

export function FindIdForm() {
  const {
    step,
    maskedId,
    cooldownTime,
    authType,
    form,
    handleMethodSubmit,
    handleSendCode,
    handleFindId,
    handleResendCode,
    goBack,
    isSendingCode,
    isFindingId,
    canResend,
  } = useFindId()

  return (
    <Form {...form}>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {/* <button
                          type="button"
                          onClick={() => field.onChange("PHONE")}
                          className={`flex items-center gap-4 rounded-xl border p-4 text-start transition-all ${
                            field.value === "PHONE"
                              ? "border-primary bg-primary/5 ring-primary ring-1"
                              : "border-border bg-bg-2 hover:border-primary/50"
                          }`}>
                          <div
                            className={`rounded-full p-2 ${field.value === "PHONE" ? "bg-primary text-white" : "bg-bg-3 text-fg-3"}`}>
                            <Phone size={20} />
                          </div>
                          <div>
                            <p className="text-fg-1 font-bold">휴대폰 번호로 찾기</p>
                            <p className="text-fg-3 text-xs">가입 시 등록한 휴대폰 번호로 인증합니다.</p>
                          </div>
                        </button> */}

                        <button
                          onClick={() => field.onChange("EMAIL")}
                          className={`flex items-center gap-4 rounded-xl border p-4 text-start transition-all ${
                            field.value === "EMAIL"
                              ? "border-primary bg-primary/5 ring-primary ring-1"
                              : "border-border bg-bg-2 hover:border-primary/50"
                          }`}>
                          <div
                            className={`rounded-full p-2 ${field.value === "EMAIL" ? "bg-primary text-white" : "bg-bg-3 text-fg-3"}`}>
                            <Mail size={20} />
                          </div>
                          <div>
                            <p className="text-fg-1 font-bold">이메일로 찾기</p>
                            <p className="text-fg-3 text-xs">가입 시 등록한 이메일 주소로 인증합니다.</p>
                          </div>
                        </button>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                onClick={handleMethodSubmit}
                variant="auth-primary"
                size="xl"
                className="w-full font-bold">
                다음
              </Button>
            </motion.div>
          )}

          {step === "target" && (
            <motion.div
              key="target"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-fg-2">{authType === "PHONE" ? "휴대폰 번호" : "이메일 주소"}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={authType === "PHONE" ? "01012345678" : "example@email.com"}
                        className="h-12"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <Button type="button" variant="ghost" onClick={goBack} className="text-fg-3 hover:text-fg-1">
                  <ChevronLeft size={16} className="mr-1" />
                  이전으로
                </Button>
              </div>
            </motion.div>
          )}

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
                  onClick={handleFindId}
                  variant="auth-primary"
                  size="xl"
                  className="w-full font-bold"
                  disabled={isFindingId || form.watch("verificationCode").length !== 6}>
                  {isFindingId ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>확인 중...</span>
                    </div>
                  ) : (
                    "확인"
                  )}
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
                  <h3 className="text-fg-1 text-xl font-bold">아이디를 찾았습니다</h3>
                  <p className="text-fg-3 mt-1 text-sm">가입하신 정보와 일치하는 아이디입니다.</p>
                </div>
              </div>

              <div className="bg-bg-2 border-border rounded-2xl border p-6 text-center">
                <p className="text-fg-3 mb-2 text-xs font-medium uppercase tracking-wider">가입된 이메일 아이디</p>
                <p className="text-primary text-xl font-bold tracking-tight">{maskedId}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <Button asChild variant="auth-primary" size="xl" className="w-full font-bold">
                  <Link href="/auth/signin">로그인하러 가기</Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="w-full font-bold">
                  <Link href="/auth/find-pw">비밀번호 찾기</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Form>
  )
}
