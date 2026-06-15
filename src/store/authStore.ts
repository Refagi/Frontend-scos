import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api/auth.api'
import type { UserResponse, LoginPayload, RegisterPayload } from '@/lib/api/types'

interface AuthState {
  user:            UserResponse | null
  isAuthenticated: boolean
  isLoading:       boolean

  login:    (payload: LoginPayload)    => Promise<{ success: boolean; role?: string; error?: string }>
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>
  logout:   () => Promise<void>
  fetchMe:  () => Promise<void>
  setUser:  (user: UserResponse) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,
      isLoading:       false,

      login: async (payload) => {
        set({ isLoading: true })
        try {
          const res  = await authApi.login(payload)
          const user = res.data?.data?.user ?? null

          if (!user) return { success: false, error: 'Respons tidak valid dari server' }

          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true, role: user.role }
        } catch (err: unknown) {
          set({ isLoading: false })
          const message = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Email atau password salah'
          return { success: false, error: String(message) }
        }
      },

      register: async (payload) => {
        set({ isLoading: true })
        try {
          const res  = await authApi.register(payload)
          const user = res.data?.data?.user ?? null

          if (!user) return { success: false, error: 'Respons tidak valid dari server' }

          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err: unknown) {
          set({ isLoading: false })
          const message = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Registrasi gagal'
          return { success: false, error: String(message) }
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (err) {
          console.error('Logout API error:', err)
          //
        }
        set({ user: null, isAuthenticated: false, isLoading: false })
      },

      fetchMe: async () => {
        try {
          const res  = await authApi.getMe()
          const user = res.data?.data ?? null
          set({ 
            user, 
            isAuthenticated: !!user 
          })
        } catch {
          set({ user: null, isAuthenticated: false })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'scos-auth',
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)