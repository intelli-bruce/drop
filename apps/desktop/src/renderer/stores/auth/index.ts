import { create } from 'zustand'
import { createAuthSlice, type AuthSlice } from './auth-slice'

export type { AuthSlice } from './auth-slice'

export const useAuthStore = create<AuthSlice>()((...a) => ({
  ...createAuthSlice(...a),
}))
