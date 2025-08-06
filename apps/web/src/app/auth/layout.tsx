"use client"

import { ReactNode, Suspense } from "react"

import { AuthErrorFallback } from "@/containers/auth/layouts/AuthErrorFallback"
import { AuthLoading } from "@/containers/auth/layouts/AuthLoading"
import { ErrorBoundary } from "@/shared/ui/error-boundary"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ErrorBoundary fallback={(error, errorInfo, resetError) => AuthErrorFallback(error, errorInfo, resetError)}>
      <Suspense fallback={<AuthLoading />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
