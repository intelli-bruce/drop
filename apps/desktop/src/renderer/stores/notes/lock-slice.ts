import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { NotesState, LockSlice, CategoryFilterSlice } from './types'

export const createLockSlice: StateCreator<NotesState, [], [], LockSlice> = (set, get) => ({
  temporarilyUnlockedNoteIds: new Set<string>(),

  temporarilyUnlockNote: (noteId: string) => {
    set((state) => {
      const newSet = new Set(state.temporarilyUnlockedNoteIds)
      newSet.add(noteId)
      return { temporarilyUnlockedNoteIds: newSet }
    })
  },

  relockNote: (noteId: string) => {
    set((state) => {
      const newSet = new Set(state.temporarilyUnlockedNoteIds)
      newSet.delete(noteId)
      return { temporarilyUnlockedNoteIds: newSet }
    })
  },

  temporarilyUnlockAll: () => {
    const lockedNoteIds = get()
      .notes.filter((note) => note.isLocked)
      .map((note) => note.id)
    set({ temporarilyUnlockedNoteIds: new Set(lockedNoteIds) })
  },

  relockAll: () => {
    set({ temporarilyUnlockedNoteIds: new Set() })
  },

  permanentlyUnlockNote: async (noteId: string) => {
    const { error } = await supabase.from('notes').update({ is_locked: false }).eq('id', noteId)

    if (error) {
      console.error('[lock] permanentlyUnlockNote failed', error)
      return
    }

    set((state) => {
      const newSet = new Set(state.temporarilyUnlockedNoteIds)
      newSet.delete(noteId)
      return {
        notes: state.notes.map((n) => (n.id === noteId ? { ...n, isLocked: false } : n)),
        temporarilyUnlockedNoteIds: newSet,
      }
    })
  },

  lockNote: async (noteId: string) => {
    const { error } = await supabase.from('notes').update({ is_locked: true }).eq('id', noteId)

    if (error) {
      console.error('[lock] lockNote failed', error)
      return
    }

    set((state) => ({
      notes: state.notes.map((n) => (n.id === noteId ? { ...n, isLocked: true } : n)),
    }))
  },

  hasLockedNotes: () => {
    return get().notes.some((note) => note.isLocked)
  },
})

export const createCategoryFilterSlice: StateCreator<NotesState, [], [], CategoryFilterSlice> = (set) => ({
  categoryFilter: null,

  setCategoryFilter: (filter) => {
    set({ categoryFilter: filter })
  },
})
