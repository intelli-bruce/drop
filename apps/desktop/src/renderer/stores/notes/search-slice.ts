import type { StateCreator } from 'zustand'
import type { NotesState, SearchSlice } from './types'

export const createSearchSlice: StateCreator<NotesState, [], [], SearchSlice> = (set) => ({
  searchQuery: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
})
