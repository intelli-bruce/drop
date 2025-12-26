import type { Note, Attachment, Tag } from '@drop/shared'

// Notes slice
export interface NotesSlice {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean

  loadNotes: () => Promise<void>
  createNote: (initialContent?: string, parentId?: string) => Promise<Note>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string | null) => void
  subscribeToChanges: () => () => void
}

// Tags slice
export interface TagsSlice {
  allTags: Tag[]
  filterTag: string | null

  loadTags: () => Promise<void>
  addTagToNote: (noteId: string, tagName: string) => Promise<void>
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>
  setFilterTag: (tagName: string | null) => void
}

// Attachments slice
export interface AttachmentsSlice {
  addAttachment: (noteId: string, file: File) => Promise<Attachment | null>
  removeAttachment: (noteId: string, attachmentId: string) => Promise<void>
}

// Instagram slice
export interface InstagramSlice {
  createNoteWithInstagram: (url: string) => Promise<Note | null>
}

// YouTube slice
export interface YouTubeSlice {
  createNoteWithYouTube: (url: string) => Promise<Note | null>
}

// Combined store state
export interface NotesState extends NotesSlice, TagsSlice, AttachmentsSlice, InstagramSlice, YouTubeSlice {}
