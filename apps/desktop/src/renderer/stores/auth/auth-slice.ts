import type { StateCreator } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export interface AuthSlice {
  user: User | null
  session: Session | null
  isAuthLoading: boolean

  initializeAuth: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

// Parse OAuth callback URL and extract tokens
function parseOAuthCallbackUrl(
  url: string
): { accessToken: string; refreshToken: string } | null {
  try {
    // URL format: drop://auth/callback#access_token=xxx&refresh_token=xxx&...
    const hashIndex = url.indexOf('#')
    if (hashIndex === -1) return null

    const hash = url.substring(hashIndex + 1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) return null

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Failed to parse OAuth callback URL:', error)
    return null
  }
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  session: null,
  isAuthLoading: true,

  initializeAuth: async () => {
    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({
        session,
        user: session?.user ?? null,
        isAuthLoading: false,
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        })
      })

      // Listen for OAuth callback from main process (Electron)
      if (window.api?.auth?.onCallback) {
        window.api.auth.onCallback(async (url: string) => {
          console.log('[auth] Received OAuth callback:', url)

          const tokens = parseOAuthCallbackUrl(url)
          if (!tokens) {
            console.error('[auth] Failed to parse OAuth callback URL')
            return
          }

          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken,
            })

            if (error) {
              console.error('[auth] Failed to set session:', error)
              return
            }

            set({
              session: data.session,
              user: data.session?.user ?? null,
            })
          } catch (error) {
            console.error('[auth] Error setting session:', error)
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ isAuthLoading: false })
    }
  },

  signInWithGoogle: async () => {
    set({ isAuthLoading: true })

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'drop://auth/callback',
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error

      // For Electron, open OAuth URL in external browser
      if (data.url) {
        await window.api.openExternal(data.url)
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
    } finally {
      set({ isAuthLoading: false })
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  },
})
