// PRD 3.2 Schema 기반 타입 정의

export type NoteSource = 'mobile' | 'desktop' | 'web'

export type AttachmentType = 'image' | 'audio' | 'video' | 'file'

// Database row types (snake_case - Supabase 컬럼명과 일치)
export interface NoteRow {
  id: string
  content: string | null
  created_at: string
  updated_at: string
  source: NoteSource
  is_deleted: boolean
}

export interface AttachmentRow {
  id: string
  note_id: string
  type: AttachmentType
  storage_path: string
  filename: string | null
  mime_type: string | null
  size: number | null
  created_at: string
}

export interface TagRow {
  id: string
  name: string
  created_at: string
}

export interface NoteTagRow {
  note_id: string
  tag_id: string
}

// Application types (camelCase - 앱 내부 사용)
export interface Note {
  id: string
  content: string
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
  source: NoteSource
  isDeleted: boolean
}

export interface Attachment {
  id: string
  noteId: string
  type: AttachmentType
  storagePath: string
  filename?: string
  mimeType?: string
  size?: number
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  createdAt: Date
}

// Input types
export interface CreateNoteInput {
  content: string
  source: NoteSource
}

export interface UpdateNoteInput {
  content?: string
}

export interface CreateAttachmentInput {
  noteId: string
  type: AttachmentType
  storagePath: string
  filename?: string
  mimeType?: string
  size?: number
}

// Row <-> App type 변환 함수
export function noteRowToNote(row: NoteRow, attachments: Attachment[] = []): Note {
  return {
    id: row.id,
    content: row.content ?? '',
    attachments,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    source: row.source,
    isDeleted: row.is_deleted,
  }
}

export function attachmentRowToAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    noteId: row.note_id,
    type: row.type,
    storagePath: row.storage_path,
    filename: row.filename ?? undefined,
    mimeType: row.mime_type ?? undefined,
    size: row.size ?? undefined,
    createdAt: new Date(row.created_at),
  }
}
