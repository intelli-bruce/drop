import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { NotesState, LockSlice, CategoryFilterSlice } from './types'

export const createLockSlice: StateCreator<NotesState, [], [], LockSlice> = (set, get) => ({
  sessionUnlocked: false,

  unlockSession: () => {
    set({ sessionUnlocked: true })
  },

  lockSession: () => {
    set({ sessionUnlocked: false })
  },

  toggleNoteLock: async (noteId: string) => {
    const note = get().notes.find((n) => n.id === noteId)
    if (!note) return

    const newLockState = !note.isLocked

    const { error } = await supabase
      .from('notes')
      .update({ is_locked: newLockState })
      .eq('id', noteId)

    if (error) {
      console.error('[lock] toggleNoteLock failed', error)
      return
    }

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId ? { ...n, isLocked: newLockState } : n
      ),
    }))
  },
})

export const createCategoryFilterSlice: StateCreator<NotesState, [], [], CategoryFilterSlice> = (set) => ({
  categoryFilter: null,

  setCategoryFilter: (filter) => {
    set({ categoryFilter: filter })
  },
})
