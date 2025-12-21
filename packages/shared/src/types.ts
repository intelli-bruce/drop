export type NoteSource = 'mobile' | 'desktop' | 'web'

export interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  source: NoteSource
  isDeleted: boolean
}

export interface Tag {
  id: string
  name: string
  createdAt: Date
}

export interface NoteTag {
  noteId: string
  tagId: string
}

export interface CreateNoteInput {
  content: string
  source: NoteSource
}

export interface UpdateNoteInput {
  content?: string
}
