"use client"
/**
 * Hack to work around next.js hydration
 * @see https://github.com/uidotdev/usehooks/issues/218
 */
import React from "react"
import { useIsClient } from "@uidotdev/usehooks"

type ClientOnlyProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const isClient = useIsClient()

  // Render children if on client side, otherwise fallback
  return isClient ? <>{children}</> : <>{fallback}</>
}
