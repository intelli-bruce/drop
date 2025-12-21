import type { Database } from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import type {
  Note,
  Attachment,
  CreateNoteInput,
  UpdateNoteInput,
  CreateAttachmentInput,
  AttachmentType,
} from '@throw/shared'

interface NoteRow {
  id: string
  content: string
  created_at: string
  updated_at: string
  source: 'mobile' | 'desktop' | 'web'
  is_deleted: number
}

interface AttachmentRow {
  id: string
  note_id: string
  type: AttachmentType
  data: string
  title: string | null
  mime_type: string | null
  size: number | null
  created_at: string
}

function rowToAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    noteId: row.note_id,
    type: row.type,
    data: row.data,
    title: row.title ?? undefined,
    mimeType: row.mime_type ?? undefined,
    size: row.size ?? undefined,
    createdAt: new Date(row.created_at),
  }
}

function rowToNote(row: NoteRow, attachments: Attachment[] = []): Note {
  return {
    id: row.id,
    content: row.content,
    attachments,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    source: row.source,
    isDeleted: row.is_deleted === 1,
  }
}

export class NotesRepository {
  constructor(private db: Database) {}

  private getAttachments(noteId: string): Attachment[] {
    const rows = this.db
      .prepare('SELECT * FROM attachments WHERE note_id = ? ORDER BY created_at ASC')
      .all(noteId) as AttachmentRow[]

    return rows.map(rowToAttachment)
  }

  create(input: CreateNoteInput): Note {
    const id = uuidv4()
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO notes (id, content, created_at, updated_at, source, is_deleted)
         VALUES (?, ?, ?, ?, ?, 0)`
      )
      .run(id, input.content, now, now, input.source)

    // Insert attachments if any
    if (input.attachments && input.attachments.length > 0) {
      const insertAttachment = this.db.prepare(
        `INSERT INTO attachments (id, note_id, type, data, title, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )

      for (const attachment of input.attachments) {
        insertAttachment.run(
          uuidv4(),
          id,
          attachment.type,
          attachment.data,
          attachment.title ?? null,
          now
        )
      }
    }

    return this.findById(id)!
  }

  findById(id: string): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined

    if (!row) return null

    const attachments = this.getAttachments(id)
    return rowToNote(row, attachments)
  }

  findAll(): Note[] {
    const rows = this.db
      .prepare('SELECT * FROM notes WHERE is_deleted = 0 ORDER BY created_at DESC')
      .all() as NoteRow[]

    return rows.map((row) => {
      const attachments = this.getAttachments(row.id)
      return rowToNote(row, attachments)
    })
  }

  update(id: string, input: UpdateNoteInput): Note | null {
    const existing = this.findById(id)
    if (!existing) return null

    const now = new Date().toISOString()
    const content = input.content ?? existing.content

    this.db.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?').run(content, now, id)

    return this.findById(id)
  }

  softDelete(id: string): boolean {
    const result = this.db
      .prepare('UPDATE notes SET is_deleted = 1, updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), id)

    return result.changes > 0
  }

  // Attachment methods
  addAttachment(noteId: string, input: CreateAttachmentInput): Attachment | null {
    const note = this.findById(noteId)
    if (!note) return null

    const id = uuidv4()
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO attachments (id, note_id, type, data, title, mime_type, size, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        noteId,
        input.type,
        input.data,
        input.title ?? null,
        input.mimeType ?? null,
        input.size ?? null,
        now
      )

    // Update note's updated_at
    this.db.prepare('UPDATE notes SET updated_at = ? WHERE id = ?').run(now, noteId)

    const row = this.db.prepare('SELECT * FROM attachments WHERE id = ?').get(id) as AttachmentRow
    return rowToAttachment(row)
  }

  removeAttachment(attachmentId: string): boolean {
    const attachment = this.db
      .prepare('SELECT note_id FROM attachments WHERE id = ?')
      .get(attachmentId) as { note_id: string } | undefined

    if (!attachment) return false

    const result = this.db.prepare('DELETE FROM attachments WHERE id = ?').run(attachmentId)

    if (result.changes > 0) {
      // Update note's updated_at
      this.db
        .prepare('UPDATE notes SET updated_at = ? WHERE id = ?')
        .run(new Date().toISOString(), attachment.note_id)
    }

    return result.changes > 0
  }
}
