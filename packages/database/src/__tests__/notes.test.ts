import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createDatabase, NotesRepository } from '../index'
import type { Database } from 'better-sqlite3'

describe('NotesRepository', () => {
  let db: Database
  let notes: NotesRepository

  beforeEach(() => {
    db = createDatabase(':memory:')
    notes = new NotesRepository(db)
  })

  afterEach(() => {
    db.close()
  })

  describe('create', () => {
    it('should create a new note', () => {
      const note = notes.create({ content: 'Hello World', source: 'desktop' })

      expect(note.id).toBeDefined()
      expect(note.content).toBe('Hello World')
      expect(note.source).toBe('desktop')
      expect(note.isDeleted).toBe(false)
      expect(note.createdAt).toBeInstanceOf(Date)
      expect(note.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('findById', () => {
    it('should find a note by id', () => {
      const created = notes.create({ content: 'Test note', source: 'desktop' })
      const found = notes.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
      expect(found?.content).toBe('Test note')
    })

    it('should return null for non-existent id', () => {
      const found = notes.findById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all non-deleted notes', () => {
      notes.create({ content: 'Note 1', source: 'desktop' })
      notes.create({ content: 'Note 2', source: 'desktop' })

      const allNotes = notes.findAll()

      expect(allNotes).toHaveLength(2)
    })

    it('should not return deleted notes', () => {
      const note = notes.create({ content: 'To be deleted', source: 'desktop' })
      notes.softDelete(note.id)

      const allNotes = notes.findAll()

      expect(allNotes).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update note content', () => {
      const note = notes.create({ content: 'Original', source: 'desktop' })
      const updated = notes.update(note.id, { content: 'Updated' })

      expect(updated?.content).toBe('Updated')
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(note.updatedAt.getTime())
    })

    it('should return null for non-existent id', () => {
      const updated = notes.update('non-existent', { content: 'New' })
      expect(updated).toBeNull()
    })
  })

  describe('softDelete', () => {
    it('should mark note as deleted', () => {
      const note = notes.create({ content: 'To delete', source: 'desktop' })
      const deleted = notes.softDelete(note.id)

      expect(deleted).toBe(true)

      const found = notes.findById(note.id)
      expect(found?.isDeleted).toBe(true)
    })
  })
})
