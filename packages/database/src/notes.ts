import type { Database } from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@throw/shared'

interface NoteRow {
  id: string
  content: string
  created_at: string
  updated_at: string
  source: 'mobile' | 'desktop' | 'web'
  is_deleted: number
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    content: row.content,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    source: row.source,
    isDeleted: row.is_deleted === 1,
  }
}

export class NotesRepository {
  constructor(private db: Database) {}

  create(input: CreateNoteInput): Note {
    const id = uuidv4()
    const now = new Date().toISOString()

    this.db
      .prepare(
        `INSERT INTO notes (id, content, created_at, updated_at, source, is_deleted)
         VALUES (?, ?, ?, ?, ?, 0)`
      )
      .run(id, input.content, now, now, input.source)

    return this.findById(id)!
  }

  findById(id: string): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined

    return row ? rowToNote(row) : null
  }

  findAll(): Note[] {
    const rows = this.db
      .prepare('SELECT * FROM notes WHERE is_deleted = 0 ORDER BY created_at DESC')
      .all() as NoteRow[]

    return rows.map(rowToNote)
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
}
