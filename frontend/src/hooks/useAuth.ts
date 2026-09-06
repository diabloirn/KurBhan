import { useAuthStore } from '../context/AuthContext'

export function useAuth() {
  const store = useAuthStore()
  return {
    ...store,
    isAuthenticated: !!store.token,
  }
}

