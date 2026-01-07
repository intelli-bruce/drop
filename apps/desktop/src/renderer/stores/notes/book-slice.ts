/// <reference path="../../../preload/index.d.ts" />
import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import {
  bookRowToBook,
  noteRowToNote,
  attachmentRowToAttachment,
  tagRowToTag,
  type BookRow,
  type Book,
  type ReadingStatus,
  type BookWithNotes,
  type AladinSearchResult,
  type NoteRow,
  type AttachmentRow,
  type TagRow,
} from '@drop/shared'
import type { NotesState, BookSlice } from './types'

export const createBookSlice: StateCreator<NotesState, [], [], BookSlice> = (set, get) => ({
  // State
  books: [],
  selectedBookId: null,
  selectedBookWithNotes: null,
  isBookSearchOpen: false,
  bookSearchMode: 'add',
  linkTargetNoteId: null,
  librarySearchResults: [],
  aladinSearchResults: [],
  isSearchingBooks: false,
  isBooksLoading: false,
  bookFilter: 'all',

  // 책 목록 로드
  loadBooks: async () => {
    set({ isBooksLoading: true })

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[book] loadBooks failed', error)
        return
      }

      const books = (data as BookRow[]).map(bookRowToBook)
      set({ books, isBooksLoading: false })
      console.info('[book] loadBooks success', { count: books.length })
    } catch (error) {
      console.error('[book] loadBooks failed', error)
      set({ isBooksLoading: false })
    }
  },

  setBookFilter: (filter: ReadingStatus | 'all') => {
    set({ bookFilter: filter })
  },

  // 검색 모달
  openBookSearch: () => {
    set({
      isBookSearchOpen: true,
      bookSearchMode: 'add',
      linkTargetNoteId: null,
      librarySearchResults: [],
      aladinSearchResults: [],
      isSearchingBooks: false,
    })
  },

  // 노트에 책 연결용 검색 모달
  openBookSearchForLinking: (noteId: string) => {
    set({
      isBookSearchOpen: true,
      bookSearchMode: 'link',
      linkTargetNoteId: noteId,
      librarySearchResults: [],
      aladinSearchResults: [],
      isSearchingBooks: false,
    })
  },

  closeBookSearch: () => {
    set({
      isBookSearchOpen: false,
      bookSearchMode: 'add',
      linkTargetNoteId: null,
      librarySearchResults: [],
      aladinSearchResults: [],
      isSearchingBooks: false,
    })
  },

  searchBooks: async (query: string) => {
    if (!query.trim()) {
      set({ librarySearchResults: [], aladinSearchResults: [], isSearchingBooks: false })
      return
    }

    set({ isSearchingBooks: true })
    const { books, bookSearchMode } = get()
    console.info('[book] searchBooks start', { query, mode: bookSearchMode })

    try {
      // 1. 내 서재에서 먼저 검색 (제목, 저자로 검색)
      const lowerQuery = query.toLowerCase()
      const libraryResults = books.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery) ||
          book.isbn13.includes(query)
      )
      console.info('[book] library search result', { count: libraryResults.length })

      // link 모드에서는 내 서재만 검색
      if (bookSearchMode === 'link') {
        set({
          librarySearchResults: libraryResults,
          aladinSearchResults: [],
          isSearchingBooks: false,
        })
        return
      }

      // 2. add 모드: 알라딘 API로도 검색
      const aladinResults = (await window.api.aladin.search(query)) as AladinSearchResult[]
      console.info('[book] aladin search result', { count: aladinResults?.length ?? 0 })

      // 3. 알라딘 결과에서 이미 내 서재에 있는 책 제외
      const libraryIsbn13s = new Set(books.map((b) => b.isbn13))
      const filteredAladinResults = (aladinResults ?? []).filter(
        (result) => !libraryIsbn13s.has(result.isbn13)
      )

      set({
        librarySearchResults: libraryResults,
        aladinSearchResults: filteredAladinResults,
        isSearchingBooks: false,
      })
    } catch (error) {
      console.error('[book] searchBooks failed', error)
      set({ librarySearchResults: [], aladinSearchResults: [], isSearchingBooks: false })
    }
  },

  // 책을 라이브러리에 추가
  addBookToLibrary: async (isbn13: string): Promise<Book | null> => {
    console.info('[book] addBookToLibrary start', { isbn13 })

    try {
      // 0. 유저 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error('[book] addBookToLibrary failed - no user')
        return null
      }

      // 1. 이미 존재하는지 확인
      const { data: existingBook } = await supabase
        .from('books')
        .select('*')
        .eq('isbn13', isbn13)
        .single()

      if (existingBook) {
        console.info('[book] book already exists', { isbn13 })
        return bookRowToBook(existingBook as BookRow)
      }

      // 2. 알라딘 API로 상세 정보 조회
      const bookDetail = await window.api.aladin.getBookByIsbn(isbn13)
      if (!bookDetail) {
        console.error('[book] getBookByIsbn failed - no data')
        return null
      }
      console.info('[book] book detail fetched', { title: bookDetail.title })

      // 3. 표지 이미지 다운로드 및 Storage 업로드
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

      // 4. books 테이블에 저장
      const { data, error } = await supabase
        .from('books')
        .insert({
          user_id: user.id,
          isbn13: bookDetail.isbn13,
          title: bookDetail.title,
          author: bookDetail.author,
          publisher: bookDetail.publisher,
          pub_date: bookDetail.pubDate,
          description: bookDetail.description,
          cover_storage_path: coverStoragePath,
          cover_url: bookDetail.cover,
          reading_status: 'to_read' as ReadingStatus,
        })
        .select()
        .single()

      if (error) {
        console.error('[book] insert failed', error)
        return null
      }

      const book = bookRowToBook(data as BookRow)
      console.info('[book] book added to library', { bookId: book.id, title: book.title })

      // 5. 상태 업데이트
      set((state) => ({
        books: [book, ...state.books],
      }))

      return book
    } catch (error) {
      console.error('[book] addBookToLibrary failed', error)
      return null
    }
  },

  // 읽기 상태 업데이트
  updateBookStatus: async (
    bookId: string,
    status: ReadingStatus,
    options?: { rating?: number }
  ) => {
    console.info('[book] updateBookStatus', { bookId, status, options })

    const updates: Record<string, unknown> = { reading_status: status }

    // 상태에 따라 날짜 자동 설정
    if (status === 'reading') {
      updates.started_at = new Date().toISOString()
    } else if (status === 'completed') {
      updates.finished_at = new Date().toISOString()
      if (options?.rating !== undefined) {
        updates.rating = options.rating
      }
    }

    try {
      const { error } = await supabase.from('books').update(updates).eq('id', bookId)

      if (error) {
        console.error('[book] updateBookStatus failed', error)
        return
      }

      // 상태 업데이트
      set((state) => ({
        books: state.books.map((b) =>
          b.id === bookId
            ? {
                ...b,
                readingStatus: status,
                startedAt: status === 'reading' ? new Date() : b.startedAt,
                finishedAt: status === 'completed' ? new Date() : b.finishedAt,
                rating: options?.rating ?? b.rating,
              }
            : b
        ),
        selectedBookWithNotes:
          state.selectedBookWithNotes?.id === bookId
            ? {
                ...state.selectedBookWithNotes,
                readingStatus: status,
                startedAt: status === 'reading' ? new Date() : state.selectedBookWithNotes.startedAt,
                finishedAt:
                  status === 'completed' ? new Date() : state.selectedBookWithNotes.finishedAt,
                rating: options?.rating ?? state.selectedBookWithNotes.rating,
              }
            : state.selectedBookWithNotes,
      }))

      console.info('[book] updateBookStatus success')
    } catch (error) {
      console.error('[book] updateBookStatus failed', error)
    }
  },

  // 책 삭제
  deleteBook: async (bookId: string) => {
    console.info('[book] deleteBook', { bookId })

    try {
      const { error } = await supabase.from('books').delete().eq('id', bookId)

      if (error) {
        console.error('[book] deleteBook failed', error)
        return
      }

      set((state) => ({
        books: state.books.filter((b) => b.id !== bookId),
        selectedBookId: state.selectedBookId === bookId ? null : state.selectedBookId,
        selectedBookWithNotes:
          state.selectedBookWithNotes?.id === bookId ? null : state.selectedBookWithNotes,
      }))

      console.info('[book] deleteBook success')
    } catch (error) {
      console.error('[book] deleteBook failed', error)
    }
  },

  // 책 선택
  selectBook: (bookId: string | null) => {
    set({ selectedBookId: bookId, selectedBookWithNotes: null })

    if (bookId) {
      void get().loadBookWithNotes(bookId)
    }
  },

  // 책 상세 + 연결된 노트 로드
  loadBookWithNotes: async (bookId: string): Promise<BookWithNotes | null> => {
    console.info('[book] loadBookWithNotes', { bookId })

    try {
      // 1. 책 정보 조회
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (bookError || !bookData) {
        console.error('[book] loadBookWithNotes - book not found', bookError)
        return null
      }

      const book = bookRowToBook(bookData as BookRow)

      // 2. 연결된 노트 ID 조회
      const { data: bookNotes, error: bookNotesError } = await supabase
        .from('book_notes')
        .select('note_id')
        .eq('book_id', bookId)

      if (bookNotesError) {
        console.error('[book] loadBookWithNotes - book_notes query failed', bookNotesError)
        return null
      }

      const noteIds = bookNotes.map((bn) => bn.note_id)

      // 3. 노트 상세 정보 조회
      if (noteIds.length === 0) {
        const result: BookWithNotes = { ...book, notes: [] }
        set({ selectedBookWithNotes: result })
        return result
      }

      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .in('id', noteIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (notesError) {
        console.error('[book] loadBookWithNotes - notes query failed', notesError)
        return null
      }

      // 4. 노트의 첨부파일과 태그 조회
      const { data: attachmentsData } = await supabase
        .from('attachments')
        .select('*')
        .in('note_id', noteIds)

      const { data: noteTagsData } = await supabase.from('note_tags').select('*').in('note_id', noteIds)

      const { data: tagsData } = await supabase.from('tags').select('*')

      const attachmentsByNote = new Map<string, AttachmentRow[]>()
      const tagsByNote = new Map<string, TagRow[]>()

      attachmentsData?.forEach((a) => {
        const list = attachmentsByNote.get(a.note_id) || []
        list.push(a as AttachmentRow)
        attachmentsByNote.set(a.note_id, list)
      })

      const tagMap = new Map<string, TagRow>()
      tagsData?.forEach((t) => tagMap.set(t.id, t as TagRow))

      noteTagsData?.forEach((nt) => {
        const tag = tagMap.get(nt.tag_id)
        if (tag) {
          const list = tagsByNote.get(nt.note_id) || []
          list.push(tag)
          tagsByNote.set(nt.note_id, list)
        }
      })

      const notes = (notesData as NoteRow[]).map((row) =>
        noteRowToNote(
          row,
          (attachmentsByNote.get(row.id) || []).map(attachmentRowToAttachment),
          (tagsByNote.get(row.id) || []).map(tagRowToTag)
        )
      )

      const result: BookWithNotes = { ...book, notes }
      set({ selectedBookWithNotes: result })
      console.info('[book] loadBookWithNotes success', { bookId, notesCount: notes.length })

      return result
    } catch (error) {
      console.error('[book] loadBookWithNotes failed', error)
      return null
    }
  },

  // 노트를 책에 연결
  linkNoteToBook: async (bookId: string, noteId: string) => {
    console.info('[book] linkNoteToBook', { bookId, noteId })

    try {
      const { error } = await supabase.from('book_notes').insert({
        book_id: bookId,
        note_id: noteId,
      })

      if (error) {
        // 이미 연결된 경우 무시
        if (error.code === '23505') {
          console.info('[book] note already linked to book')
          return
        }
        console.error('[book] linkNoteToBook failed', error)
        return
      }

      // 현재 선택된 책이면 노트 목록 갱신
      if (get().selectedBookId === bookId) {
        void get().loadBookWithNotes(bookId)
      }

      console.info('[book] linkNoteToBook success')
    } catch (error) {
      console.error('[book] linkNoteToBook failed', error)
    }
  },

  // 노트-책 연결 해제
  unlinkNoteFromBook: async (bookId: string, noteId: string) => {
    console.info('[book] unlinkNoteFromBook', { bookId, noteId })

    try {
      const { error } = await supabase
        .from('book_notes')
        .delete()
        .eq('book_id', bookId)
        .eq('note_id', noteId)

      if (error) {
        console.error('[book] unlinkNoteFromBook failed', error)
        return
      }

      // 현재 선택된 책이면 노트 목록 갱신
      set((state) => {
        if (state.selectedBookWithNotes?.id === bookId) {
          return {
            selectedBookWithNotes: {
              ...state.selectedBookWithNotes,
              notes: state.selectedBookWithNotes.notes.filter((n) => n.id !== noteId),
            },
          }
        }
        return {}
      })

      console.info('[book] unlinkNoteFromBook success')
    } catch (error) {
      console.error('[book] unlinkNoteFromBook failed', error)
    }
  },
})
