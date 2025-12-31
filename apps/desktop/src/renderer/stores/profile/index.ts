import { create } from 'zustand'
import { supabase } from '../../lib/supabase'
import { hashPin } from '../../lib/pin-utils'

interface ProfileState {
  hasPin: boolean
  isLoading: boolean

  loadProfile: () => Promise<void>
  setPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  removePin: () => Promise<void>
}

export const useProfileStore = create<ProfileState>()((set) => ({
  hasPin: false,
  isLoading: true,

  loadProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      set({ isLoading: false })
      return
    }

    const { data } = await supabase
      .from('user_profiles')
      .select('pin_hash')
      .eq('user_id', user.id)
      .single()

    set({
      hasPin: Boolean(data?.pin_hash),
      isLoading: false,
    })
  },

  setPin: async (pin: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const pinHash = await hashPin(pin)

    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: user.id,
        pin_hash: pinHash,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.error('[profile] setPin failed', error)
      throw error
    }

    set({ hasPin: true })
  },

  verifyPin: async (pin: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('user_profiles')
      .select('pin_hash')
      .eq('user_id', user.id)
      .single()

    if (!data?.pin_hash) return false

    const inputHash = await hashPin(pin)
    return inputHash === data.pin_hash
  },

  removePin: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_profiles').update({ pin_hash: null }).eq('user_id', user.id)

    set({ hasPin: false })
  },
}))
