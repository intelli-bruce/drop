import { create } from 'zustand'
import type { Note, Attachment, CreateAttachmentInput } from '@throw/shared'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean

  loadNotes: () => Promise<void>
  createNote: () => Promise<Note>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string | null) => void
  addAttachment: (noteId: string, input: CreateAttachmentInput) => Promise<Attachment | null>
  removeAttachment: (noteId: string, attachmentId: string) => Promise<void>
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

  addAttachment: async (noteId, input) => {
    const attachment = await window.api.notes.addAttachment(noteId, input)
    if (attachment) {
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, attachments: [...n.attachments, attachment] } : n
        ),
      }))
    }
    return attachment
  },

  removeAttachment: async (noteId, attachmentId) => {
    await window.api.notes.removeAttachment(attachmentId)
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId
          ? { ...n, attachments: n.attachments.filter((a) => a.id !== attachmentId) }
          : n
      ),
    }))
  },
}))
