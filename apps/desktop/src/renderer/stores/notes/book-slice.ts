/// <reference path="../../../preload/index.d.ts" />
import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import {
  attachmentRowToAttachment,
  aladinResultToBookMetadata,
  type AttachmentRow,
  type Attachment,
  type AladinSearchResult,
} from '@drop/shared'
import type { NotesState, BookSlice } from './types'

export const createBookSlice: StateCreator<NotesState, [], [], BookSlice> = (set, get) => ({
  isBookSearchOpen: false,
  bookSearchResults: [],
  isSearchingBooks: false,

  openBookSearch: () => {
    set({ isBookSearchOpen: true, bookSearchResults: [], isSearchingBooks: false })
  },

  closeBookSearch: () => {
    set({ isBookSearchOpen: false, bookSearchResults: [], isSearchingBooks: false })
  },

  searchBooks: async (query: string) => {
    if (!query.trim()) {
      set({ bookSearchResults: [], isSearchingBooks: false })
      return
    }

    set({ isSearchingBooks: true })
    console.info('[book] searchBooks start', { query })

    try {
      const results = (await window.api.aladin.search(query)) as AladinSearchResult[]
      console.info('[book] searchBooks result', { count: results?.length ?? 0 })
      set({ bookSearchResults: results ?? [], isSearchingBooks: false })
    } catch (error) {
      console.error('[book] searchBooks failed', error)
      set({ bookSearchResults: [], isSearchingBooks: false })
    }
  },

  addBookToNote: async (noteId: string, isbn13: string): Promise<Attachment | null> => {
    console.info('[book] addBookToNote start', { noteId, isbn13 })

    try {
      // 1. 상세 정보 조회
      const bookDetail = await window.api.aladin.getBookByIsbn(isbn13)
      if (!bookDetail) {
        console.error('[book] getBookByIsbn failed - no data')
        return null
      }
      console.info('[book] book detail fetched', { title: bookDetail.title })

      // 2. 표지 이미지 다운로드 및 Storage 업로드
      let coverStoragePath: string | undefined
      if (bookDetail.cover) {
        const coverBase64 = await window.api.aladin.downloadCover(bookDetail.cover)
        if (coverBase64) {
          const coverBuffer = Uint8Array.from(atob(coverBase64), (c) => c.charCodeAt(0))
          const coverPath = `books/${isbn13}/cover.jpg`

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(coverPath, coverBuffer, {
              contentType: 'image/jpeg',
              upsert: true,
            })

          if (uploadError) {
            console.warn('[book] cover upload failed', uploadError)
          } else {
            coverStoragePath = coverPath
            console.info('[book] cover uploaded', { path: coverPath })
          }
        }
      }

      // 3. BookMetadata 생성
      const bookMetadata = aladinResultToBookMetadata(bookDetail, coverStoragePath)

      // 4. attachments 테이블에 저장
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          note_id: noteId,
          type: 'book',
          storage_path: coverStoragePath ?? '',
          metadata: bookMetadata,
          original_url: bookDetail.link,
          author_name: bookDetail.author,
          caption: bookDetail.title,
        })
        .select()
        .single()

      if (error) {
        console.error('[book] attachment insert failed', error)
        return null
      }

      const attachment = attachmentRowToAttachment(data as AttachmentRow)
      console.info('[book] attachment created', { attachmentId: attachment.id })

      // 5. 노트 상태 업데이트
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, attachments: [...n.attachments, attachment] } : n
        ),
      }))

      // 6. 책 태그 추가
      await get().addTagToNote(noteId, '책')

      return attachment
    } catch (error) {
      console.error('[book] addBookToNote failed', error)
      return null
    }
  },

  createNoteWithBook: async (isbn13: string) => {
    console.info('[book] createNoteWithBook start', { isbn13 })

    // 1. 새 노트 생성
    const note = await get().createNote()
    console.info('[book] note created', { noteId: note.id })

    // 2. 로딩 중 표시를 위한 skeleton attachment
    const skeletonId = `skeleton-book-${isbn13}`
    const skeletonAttachment: Attachment = {
      id: skeletonId,
      noteId: note.id,
      type: 'book',
      storagePath: '',
      createdAt: new Date(),
      metadata: { loading: true, isbn13 },
    }

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === note.id ? { ...n, attachments: [skeletonAttachment] } : n
      ),
    }))

    // 3. 비동기로 책 정보 추가
    void (async () => {
      try {
        const attachment = await get().addBookToNote(note.id, isbn13)

        if (!attachment) {
          // 실패 시 skeleton 제거
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === note.id
                ? { ...n, attachments: n.attachments.filter((a) => a.id !== skeletonId) }
                : n
            ),
          }))
          return
        }

        // addBookToNote에서 이미 상태 업데이트했으므로 skeleton만 제거
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === note.id
              ? { ...n, attachments: n.attachments.filter((a) => a.id !== skeletonId) }
              : n
          ),
        }))
      } catch (error) {
        console.error('[book] createNoteWithBook background task failed', error)
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === note.id
              ? { ...n, attachments: n.attachments.filter((a) => a.id !== skeletonId) }
              : n
          ),
        }))
      }
    })()

    return get().notes.find((item) => item.id === note.id) ?? note
  },
})
