import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import {
  tagRowToTag,
  noteRowToNote,
  attachmentRowToAttachment,
} from '@drop/shared'
import type { NoteRow, AttachmentRow, TagRow, Attachment, Tag } from '@drop/shared'
import type { NotesState, NotesSlice } from './types'

export const createNotesSlice: StateCreator<NotesState, [], [], NotesSlice> = (set) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true })
    try {
      // 노트 로드
      const { data: noteRows, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (notesError) throw notesError

      // 모든 첨부파일 로드
      const noteIds = noteRows?.map((n) => n.id) ?? []
      let attachmentRows: AttachmentRow[] = []

      if (noteIds.length > 0) {
        const { data, error: attachmentsError } = await supabase
          .from('attachments')
          .select('*')
          .in('note_id', noteIds)
          .order('created_at', { ascending: true })

        if (attachmentsError) throw attachmentsError
        attachmentRows = (data ?? []) as AttachmentRow[]
      }

      // 모든 태그 관계 로드
      interface NoteTagWithTag {
        note_id: string
        tag_id: string
        tags: TagRow
      }
      let noteTagRows: NoteTagWithTag[] = []
      if (noteIds.length > 0) {
        const { data, error: noteTagsError } = await supabase
          .from('note_tags')
          .select('note_id, tag_id, tags(*)')
          .in('note_id', noteIds)

        if (noteTagsError) throw noteTagsError
        noteTagRows = (data ?? []) as unknown as NoteTagWithTag[]
      }

      // 첨부파일을 노트별로 그룹화
      const attachmentsByNote = new Map<string, Attachment[]>()
      for (const row of attachmentRows) {
        const attachment = attachmentRowToAttachment(row)
        const existing = attachmentsByNote.get(attachment.noteId) ?? []
        existing.push(attachment)
        attachmentsByNote.set(attachment.noteId, existing)
      }

      // 태그를 노트별로 그룹화
      const tagsByNote = new Map<string, Tag[]>()
      for (const row of noteTagRows) {
        const tag = tagRowToTag(row.tags)
        const existing = tagsByNote.get(row.note_id) ?? []
        existing.push(tag)
        tagsByNote.set(row.note_id, existing)
      }

      // 노트와 첨부파일, 태그 결합
      const notes = (noteRows ?? []).map((row) =>
        noteRowToNote(
          row as NoteRow,
          attachmentsByNote.get(row.id) ?? [],
          tagsByNote.get(row.id) ?? []
        )
      )

      set({ notes, isLoading: false })
    } catch (error) {
      console.error('Failed to load notes:', error)
      set({ isLoading: false })
    }
  },

  createNote: async (initialContent = '', parentId?: string) => {
    const id = crypto.randomUUID()
    const now = new Date()
    const optimisticNote = {
      id,
      content: initialContent,
      parentId: parentId ?? null,
      attachments: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
      source: 'desktop' as const,
      isDeleted: false,
    }

    set((state) => ({
      notes: [optimisticNote, ...state.notes],
      selectedNoteId: id,
    }))
    console.info('[notes] createNote optimistic', { id, parentId })

    const { data, error } = await supabase
      .from('notes')
      .insert({
        id,
        content: initialContent,
        parent_id: parentId ?? null,
        source: 'desktop',
      })
      .select()
      .single()

    if (error) {
      console.error('[notes] createNote supabase error', error)
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      }))
      throw error
    }

    const note = noteRowToNote(data as NoteRow)
    set((state) => ({
      notes: state.notes.map((item) => (item.id === id ? note : item)),
    }))
    console.info('[notes] createNote confirmed', { id })
    return note
  },

  updateNote: async (id, content) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, content, updatedAt: new Date(data.updated_at) } : n
      ),
    }))
  },

  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').update({ is_deleted: true }).eq('id', id)

    if (error) throw error

    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }))
  },

  selectNote: (id) => {
    set({ selectedNoteId: id })
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        async (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload

          if (eventType === 'INSERT') {
            const note = noteRowToNote(newRow as NoteRow)
            set((state) => {
              // 이미 존재하면 무시 (로컬에서 생성한 경우)
              if (state.notes.some((n) => n.id === note.id)) return state
              return { notes: [note, ...state.notes] }
            })
          } else if (eventType === 'UPDATE') {
            const row = newRow as NoteRow
            if (row.is_deleted) {
              set((state) => ({
                notes: state.notes.filter((n) => n.id !== row.id),
              }))
            } else {
              set((state) => ({
                notes: state.notes.map((n) =>
                  n.id === row.id
                    ? { ...n, content: row.content ?? '', updatedAt: new Date(row.updated_at) }
                    : n
                ),
              }))
            }
          } else if (eventType === 'DELETE') {
            const id = (oldRow as { id: string }).id
            set((state) => ({
              notes: state.notes.filter((n) => n.id !== id),
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
})
