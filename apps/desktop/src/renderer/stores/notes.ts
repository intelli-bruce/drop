import { create } from 'zustand'
import { supabase, uploadAttachment } from '../lib/supabase'
import type { Note, Attachment, NoteRow, AttachmentRow } from '@throw/shared'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean

  loadNotes: () => Promise<void>
  createNote: () => Promise<Note>
  createNoteWithInstagram: (url: string) => Promise<Note | null>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string | null) => void
  addAttachment: (noteId: string, file: File) => Promise<Attachment | null>
  removeAttachment: (noteId: string, attachmentId: string) => Promise<void>
  subscribeToChanges: () => () => void
}

// Row -> App type 변환
function rowToNote(row: NoteRow, attachments: Attachment[] = []): Note {
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

function rowToAttachment(row: AttachmentRow): Attachment {
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

function fileFromDataUrl(dataUrl: string, filename: string): File | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null

  const mimeType = match[1]
  const base64Data = match[2]
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })

  return new File([blob], filename, { type: mimeType })
}

function extensionFromMime(mimeType: string): string {
  const [, subtype] = mimeType.split('/')
  if (!subtype) return 'bin'
  return subtype === 'jpeg' ? 'jpg' : subtype
}

export const useNotesStore = create<NotesState>((set, get) => ({
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

      // 첨부파일을 노트별로 그룹화
      const attachmentsByNote = new Map<string, Attachment[]>()
      for (const row of attachmentRows) {
        const attachment = rowToAttachment(row)
        const existing = attachmentsByNote.get(attachment.noteId) ?? []
        existing.push(attachment)
        attachmentsByNote.set(attachment.noteId, existing)
      }

      // 노트와 첨부파일 결합
      const notes = (noteRows ?? []).map((row) =>
        rowToNote(row as NoteRow, attachmentsByNote.get(row.id) ?? [])
      )

      set({ notes, isLoading: false })
    } catch (error) {
      console.error('Failed to load notes:', error)
      set({ isLoading: false })
    }
  },

  createNote: async () => {
    const id = crypto.randomUUID()
    const now = new Date()
    const optimisticNote: Note = {
      id,
      content: '',
      attachments: [],
      createdAt: now,
      updatedAt: now,
      source: 'desktop',
      isDeleted: false,
    }

    set((state) => ({
      notes: [optimisticNote, ...state.notes],
      selectedNoteId: id,
    }))

    const { data, error } = await supabase
      .from('notes')
      .insert({
        id,
        content: '',
        source: 'desktop',
      })
      .select()
      .single()

    if (error) {
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      }))
      throw error
    }

    const note = rowToNote(data as NoteRow)
    set((state) => ({
      notes: state.notes.map((item) => (item.id === id ? note : item)),
    }))
    return note
  },

  createNoteWithInstagram: async (url) => {
    const match = url.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/)
    const shortcode = match ? match[1] : null
    if (!shortcode) return null

    const note = await get().createNote()

    void (async () => {
      try {
        const loggedIn = await window.api.instagram.ensureLogin()
        if (!loggedIn) return

        const postData = await window.api.instagram.fetchPost(url)
        if (!postData) return

        const caption = postData.caption?.trim()
        if (caption) {
          await get().updateNote(note.id, caption)
        }

        const mediaItems =
          postData.media && postData.media.length > 0
            ? postData.media
            : postData.displayUrl
            ? [
                {
                  displayUrl: postData.displayUrl,
                  videoUrl: postData.videoUrl,
                  typename: postData.typename,
                },
              ]
            : []

        for (const [index, media] of mediaItems.entries()) {
          if (!media.imageBase64) continue
          const mimeMatch = media.imageBase64.match(/^data:([^;]+);base64,/)
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
          const extension = extensionFromMime(mimeType)
          const file = fileFromDataUrl(
            media.imageBase64,
            `instagram-${shortcode}-${index + 1}.${extension}`
          )
          if (!file) continue
          await get().addAttachment(note.id, file)
        }
      } catch (error) {
        console.error('Failed to fetch Instagram post:', error)
      }
    })()

    return get().notes.find((item) => item.id === note.id) ?? note
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

  addAttachment: async (noteId, file) => {
    // Storage에 파일 업로드
    const { path, error: uploadError } = await uploadAttachment(file, noteId)
    if (uploadError) {
      console.error('Failed to upload attachment:', uploadError)
      return null
    }

    // 첨부파일 타입 결정
    let type: 'image' | 'audio' | 'video' | 'file' = 'file'
    if (file.type.startsWith('image/')) type = 'image'
    else if (file.type.startsWith('audio/')) type = 'audio'
    else if (file.type.startsWith('video/')) type = 'video'

    // DB에 레코드 삽입
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        note_id: noteId,
        type,
        storage_path: path,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create attachment record:', error)
      return null
    }

    const attachment = rowToAttachment(data as AttachmentRow)

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId ? { ...n, attachments: [...n.attachments, attachment] } : n
      ),
    }))

    return attachment
  },

  removeAttachment: async (noteId, attachmentId) => {
    // 먼저 storage_path 조회
    const { data: attachment } = await supabase
      .from('attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single()

    if (attachment?.storage_path) {
      // Storage에서 파일 삭제
      await supabase.storage.from('attachments').remove([attachment.storage_path])
    }

    // DB에서 레코드 삭제
    const { error } = await supabase.from('attachments').delete().eq('id', attachmentId)

    if (error) {
      console.error('Failed to delete attachment:', error)
      return
    }

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId
          ? { ...n, attachments: n.attachments.filter((a) => a.id !== attachmentId) }
          : n
      ),
    }))
  },

  // Realtime 구독
  subscribeToChanges: () => {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        async (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload

          if (eventType === 'INSERT') {
            const note = rowToNote(newRow as NoteRow)
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
}))
