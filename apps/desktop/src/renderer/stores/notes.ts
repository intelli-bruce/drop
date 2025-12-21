import { create } from 'zustand'
import { supabase, uploadAttachment } from '../lib/supabase'
import type { Note, Attachment, AttachmentType, NoteRow, AttachmentRow, Tag, TagRow } from '@throw/shared'

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  isLoading: boolean
  allTags: Tag[]
  filterTag: string | null

  loadNotes: () => Promise<void>
  loadTags: () => Promise<void>
  createNote: () => Promise<Note>
  createNoteWithInstagram: (url: string) => Promise<Note | null>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string | null) => void
  addAttachment: (noteId: string, file: File) => Promise<Attachment | null>
  removeAttachment: (noteId: string, attachmentId: string) => Promise<void>
  addTagToNote: (noteId: string, tagName: string) => Promise<void>
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>
  setFilterTag: (tagName: string | null) => void
  subscribeToChanges: () => () => void
}

// Row -> App type 변환
function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at),
  }
}

function rowToNote(row: NoteRow, attachments: Attachment[] = [], tags: Tag[] = []): Note {
  return {
    id: row.id,
    content: row.content ?? '',
    attachments,
    tags,
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
    metadata: row.metadata ?? undefined,
    originalUrl: row.original_url ?? undefined,
    authorName: row.author_name ?? undefined,
    authorUrl: row.author_url ?? undefined,
    caption: row.caption ?? undefined,
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

function normalizeExternalUrl(value: string): string {
  try {
    const url = new URL(value)
    url.hash = ''
    url.search = ''
    return url.toString()
  } catch {
    return value
  }
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  isLoading: false,
  allTags: [],
  filterTag: null,

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
        const attachment = rowToAttachment(row)
        const existing = attachmentsByNote.get(attachment.noteId) ?? []
        existing.push(attachment)
        attachmentsByNote.set(attachment.noteId, existing)
      }

      // 태그를 노트별로 그룹화
      const tagsByNote = new Map<string, Tag[]>()
      for (const row of noteTagRows) {
        const tag = rowToTag(row.tags)
        const existing = tagsByNote.get(row.note_id) ?? []
        existing.push(tag)
        tagsByNote.set(row.note_id, existing)
      }

      // 노트와 첨부파일, 태그 결합
      const notes = (noteRows ?? []).map((row) =>
        rowToNote(
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

  createNote: async () => {
    const id = crypto.randomUUID()
    const now = new Date()
    const optimisticNote: Note = {
      id,
      content: '',
      attachments: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
      source: 'desktop',
      isDeleted: false,
    }

    set((state) => ({
      notes: [optimisticNote, ...state.notes],
      selectedNoteId: id,
    }))
    console.info('[notes] createNote optimistic', { id })

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
      console.error('[notes] createNote supabase error', error)
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
    console.info('[notes] createNote confirmed', { id })
    return note
  },

  createNoteWithInstagram: async (url) => {
    const match = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/)
    const shortcode = match ? match[1] : null
    if (!shortcode) return null

    console.info('[instagram] createNoteWithInstagram start', { url, shortcode })
    const note = await get().createNote()
    console.info('[instagram] note created', { noteId: note.id })

    void (async () => {
      try {
        const loggedIn = await window.api.instagram.ensureLogin()
        console.info('[instagram] ensureLogin result', { loggedIn })
        if (!loggedIn) return

        const postData = await window.api.instagram.fetchPost(url)
        console.info('[instagram] fetchPost result', {
          hasData: Boolean(postData),
          mediaCount: postData?.media?.length ?? 0,
        })
        if (!postData) return

        const mediaItems = postData.media ?? []
        if (mediaItems.length === 0) {
          console.warn('[instagram] no media items available')
          return
        }

        let thumbnailAttachment: Attachment | null = null

        for (const [index, media] of mediaItems.entries()) {
          if (media.imageBase64 && (!media.videoBase64 || !thumbnailAttachment)) {
            const mimeMatch = media.imageBase64.match(/^data:([^;]+);base64,/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
            const extension = extensionFromMime(mimeType)
            const imageFile = fileFromDataUrl(
              media.imageBase64,
              `instagram-${shortcode}-${index + 1}.${extension}`
            )
            if (imageFile) {
              console.info('[instagram] uploading image', {
                noteId: note.id,
                index,
                name: imageFile.name,
                size: imageFile.size,
                type: imageFile.type,
              })
              const attachment = await get().addAttachment(note.id, imageFile)
              if (attachment && !thumbnailAttachment) {
                thumbnailAttachment = attachment
              }
            }
          }

          if (media.videoBase64) {
            const mimeMatch = media.videoBase64.match(/^data:([^;]+);base64,/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4'
            const extension = extensionFromMime(mimeType)
            const videoFile = fileFromDataUrl(
              media.videoBase64,
              `instagram-${shortcode}-${index + 1}.${extension}`
            )
            if (videoFile) {
              console.info('[instagram] uploading video', {
                noteId: note.id,
                index,
                name: videoFile.name,
                size: videoFile.size,
                type: videoFile.type,
              })
              await get().addAttachment(note.id, videoFile)
            }
          }
        }

        if (!thumbnailAttachment) {
          console.warn('[instagram] no thumbnail attachment available')
          return
        }

        const authorName = postData.username?.trim() || undefined
        const authorUrl =
          authorName && /^[A-Za-z0-9._]{1,30}$/.test(authorName)
            ? `https://www.instagram.com/${encodeURIComponent(authorName)}/`
            : undefined
        const originalUrl = normalizeExternalUrl(url)
        const caption = postData.caption?.trim() || undefined
        const metadata = {
          shortcode: postData.shortcode,
          postUrl: originalUrl,
          username: postData.username,
          displayName: postData.displayName,
          profilePicUrl: postData.profilePicUrl,
          timestamp: postData.timestamp,
          typename: postData.typename,
          caption,
          mediaCount: postData.media?.length ?? 0,
          media: (postData.media ?? []).map((item) => ({
            displayUrl: item.displayUrl,
            videoUrl: item.videoUrl,
            typename: item.typename,
          })),
        }

        const { data, error } = await supabase
          .from('attachments')
          .insert({
            note_id: note.id,
            type: 'instagram',
            storage_path: thumbnailAttachment.storagePath,
            filename: thumbnailAttachment.filename ?? null,
            mime_type: thumbnailAttachment.mimeType ?? null,
            size: thumbnailAttachment.size ?? null,
            metadata,
            original_url: originalUrl,
            author_name: authorName,
            author_url: authorUrl,
            caption,
          })
          .select()
          .single()

        if (error) {
          console.error('[instagram] attachment record failed', error)
          return
        }

        const attachment = rowToAttachment(data as AttachmentRow)
        console.info('[instagram] attachment created', { noteId: note.id, attachmentId: attachment.id })

        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === note.id ? { ...n, attachments: [...n.attachments, attachment] } : n
          ),
        }))
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
    console.info('[attachments] upload start', {
      noteId,
      name: file.name,
      type: file.type,
      size: file.size,
    })
    // Storage에 파일 업로드
    const { path, error: uploadError } = await uploadAttachment(file, noteId)
    if (uploadError) {
      console.error('Failed to upload attachment:', uploadError)
      return null
    }
    console.info('[attachments] upload success', { noteId, path })

    // 첨부파일 타입 결정
    let type: AttachmentType = 'file'
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
    console.info('[attachments] record created', { noteId, attachmentId: attachment.id })

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

  loadTags: async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      const allTags = (data ?? []).map((row) => rowToTag(row as TagRow))
      set({ allTags })
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  },

  addTagToNote: async (noteId, tagName) => {
    const trimmedName = tagName.trim().toLowerCase()
    if (!trimmedName) return

    try {
      // 1. 태그가 이미 존재하는지 확인, 없으면 생성
      let { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('name', trimmedName)
        .single()

      if (!existingTag) {
        const { data: newTag, error: createError } = await supabase
          .from('tags')
          .insert({ name: trimmedName })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create tag:', createError)
          return
        }
        existingTag = newTag
      }

      const tag = rowToTag(existingTag as TagRow)

      // 2. note_tags 관계 추가 (이미 있으면 무시)
      const { error: linkError } = await supabase
        .from('note_tags')
        .upsert({ note_id: noteId, tag_id: tag.id }, { onConflict: 'note_id,tag_id' })

      if (linkError) {
        console.error('Failed to link tag to note:', linkError)
        return
      }

      // 3. 로컬 상태 업데이트
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId && !n.tags.some((t) => t.id === tag.id)
            ? { ...n, tags: [...n.tags, tag] }
            : n
        ),
        allTags: state.allTags.some((t) => t.id === tag.id)
          ? state.allTags
          : [...state.allTags, tag].sort((a, b) => a.name.localeCompare(b.name)),
      }))
    } catch (error) {
      console.error('Failed to add tag to note:', error)
    }
  },

  removeTagFromNote: async (noteId, tagId) => {
    try {
      const { error } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)
        .eq('tag_id', tagId)

      if (error) {
        console.error('Failed to remove tag from note:', error)
        return
      }

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, tags: n.tags.filter((t) => t.id !== tagId) } : n
        ),
      }))
    } catch (error) {
      console.error('Failed to remove tag from note:', error)
    }
  },

  setFilterTag: (tagName) => {
    set({ filterTag: tagName })
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
