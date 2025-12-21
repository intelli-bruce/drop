import { create } from 'zustand'
import type { Note } from '@throw/shared'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean

  loadNotes: () => Promise<void>
  createNote: () => Promise<Note>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string | null) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true })
    try {
      const notes = await window.api.notes.findAll()
      set({ notes, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createNote: async () => {
    const note = await window.api.notes.create({
      content: '',
      source: 'desktop',
    })
    set((state) => ({
      notes: [note, ...state.notes],
      selectedNoteId: note.id,
    }))
    return note
  },

  updateNote: async (id, content) => {
    const updated = await window.api.notes.update(id, { content })
    if (updated) {
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
      }))
    }
  },

  deleteNote: async (id) => {
    await window.api.notes.delete(id)
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }))
  },

  selectNote: (id) => {
    set({ selectedNoteId: id })
  },
}))
