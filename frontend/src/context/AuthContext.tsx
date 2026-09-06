import { create } from 'zustand'
import { authServiceClient } from '../services/grpcClient'
import { LoginRequest, RegisterRequest } from '../proto/kurbhan_pb'

interface User {
  id: string
  fullName: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    fullName: string
    phoneNumber: string
    role?: string
  }) => Promise<string>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('kurbhan_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  token: localStorage.getItem('kurbhan_token'),
  isLoading: false,
  error: null,
  get isAuthenticated() {
    return !!this.token
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const req = new LoginRequest()
      req.setEmail(email)
      req.setPassword(password)

      const response = await authServiceClient.login(req, {})
      const token = response.getToken()
      const userProto = response.getUser()

      const user: User = {
        id: userProto?.getId() || '',
        fullName: userProto?.getFullName() || '',
        email: userProto?.getEmail() || '',
        role: userProto?.getRole() || '',
      }

      localStorage.setItem('kurbhan_token', token)
      localStorage.setItem('kurbhan_user', JSON.stringify(user))

      set({ user, token, isLoading: false, error: null })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const req = new RegisterRequest()
      req.setEmail(data.email)
      req.setPassword(data.password)
      req.setFullName(data.fullName)
      req.setPhoneNumber(data.phoneNumber)
      req.setRole(data.role || 'customer')

      const response = await authServiceClient.register(req, {})
      set({ isLoading: false, error: null })
      return response.getMessage()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registrasi gagal'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('kurbhan_token')
    localStorage.removeItem('kurbhan_user')
    set({ user: null, token: null, error: null })
  },

  clearError: () => set({ error: null }),
}))

