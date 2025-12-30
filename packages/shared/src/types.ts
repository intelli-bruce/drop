// PRD 3.2 Schema 기반 타입 정의

export type NoteSource = 'mobile' | 'desktop' | 'web'

export type AttachmentType = 'image' | 'audio' | 'video' | 'file' | 'text' | 'instagram' | 'youtube'

// Database row types (snake_case - Supabase 컬럼명과 일치)
export interface NoteRow {
  id: string
  content: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
  source: NoteSource
  is_deleted: boolean
  user_id: string | null
}

export interface AttachmentRow {
  id: string
  note_id: string
  type: AttachmentType
  storage_path: string
  filename: string | null
  mime_type: string | null
  size: number | null
  metadata: Record<string, unknown> | null
  original_url: string | null
  author_name: string | null
  author_url: string | null
  caption: string | null
  created_at: string
}

export interface TagRow {
  id: string
  name: string
  created_at: string
  user_id: string | null
}

export interface NoteTagRow {
  note_id: string
  tag_id: string
}

// Application types (camelCase - 앱 내부 사용)
export interface Note {
  id: string
  content: string
  parentId: string | null
  attachments: Attachment[]
  tags: Tag[]
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
  metadata?: Record<string, unknown>
  originalUrl?: string
  authorName?: string
  authorUrl?: string
  caption?: string
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
  metadata?: Record<string, unknown>
  originalUrl?: string
  authorName?: string
  authorUrl?: string
  caption?: string
}

// Row <-> App type 변환 함수
export function tagRowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at),
  }
}

export function noteRowToNote(
  row: NoteRow,
  attachments: Attachment[] = [],
  tags: Tag[] = []
): Note {
  return {
    id: row.id,
    content: row.content ?? '',
    parentId: row.parent_id,
    attachments,
    tags,
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
    metadata: row.metadata ?? undefined,
    originalUrl: row.original_url ?? undefined,
    authorName: row.author_name ?? undefined,
    authorUrl: row.author_url ?? undefined,
    caption: row.caption ?? undefined,
    createdAt: new Date(row.created_at),
  }
}
