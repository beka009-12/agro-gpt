"use client"

import type { ReactNode } from "react"
import { Toaster } from "react-hot-toast"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
