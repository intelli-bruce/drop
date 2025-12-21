export type NoteSource = 'mobile' | 'desktop' | 'web'

export type AttachmentType = 'image' | 'text-block' | 'file'

export interface Attachment {
  id: string
  noteId: string
  type: AttachmentType
  data: string        // base64 for image/file, raw text for text-block
  title?: string      // filename for file, optional title for text-block
  mimeType?: string   // MIME type for file
  size?: number       // file size in bytes
  createdAt: Date
}

export interface Note {
  id: string
  content: string
  attachments: Attachment[]
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

export interface CreateAttachmentInput {
  type: AttachmentType
  data: string
  title?: string
  mimeType?: string
  size?: number
}

export interface CreateNoteInput {
  content: string
  source: NoteSource
  attachments?: CreateAttachmentInput[]
}

export interface UpdateNoteInput {
  content?: string
}
