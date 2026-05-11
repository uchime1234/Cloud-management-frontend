import { create } from "zustand"
import type { AuthState } from "../types"

// First, update your types to include setToken and setUser
// Add this to your ../types file or define it here:
interface User {
  id: string
  email: string
  username?: string
  mfaEnabled?: boolean
  tier?: string
}

interface ExtendedAuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  mfaVerified: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setMfaVerified: (verified: boolean) => void
  setUserTier: (tier: string) => void
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<ExtendedAuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  mfaVerified: false,
  
  login: async (email: string, password: string) => {
    // Mock login - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    set({
      user: { 
        id: "1", 
        email, 
        username: email.split('@')[0],
        mfaEnabled: true 
      },
      isAuthenticated: true,
      mfaVerified: false,
    })
  },
 
  // In your authStore.ts, update the logout function:
logout: () => {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("mfa_user_id")
  set({ 
    user: null, 
    token: null,
    isAuthenticated: false, 
    mfaVerified: false 
  })
},
 
  setMfaVerified: (verified: boolean) => {
    set({ mfaVerified: verified })
  },
  
  setUserTier: (tier: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, tier } : null,
    }))
  },
  
  setToken: (token: string | null) => {
    set({ 
      token,
      isAuthenticated: !!token
    })
  },
  
  setUser: (user: User | null) => {
    set({ user })
  },
}))