'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace('/login')
    }
  }, [hasHydrated, token, router])

  // Esperar hidratación antes de renderizar o redirigir
  if (!hasHydrated) return null

  if (!token) return null

  return <>{children}</>
}
