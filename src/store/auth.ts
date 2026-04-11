import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  _hasHydrated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setAuth: (token, user) => {
        localStorage.setItem('auth_token', token)
        set({ token, user })
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token')
        set({ token: null, user: null })
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'escudo-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
