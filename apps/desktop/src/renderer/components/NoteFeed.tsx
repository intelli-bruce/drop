import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type { Note } from '@drop/shared'
import { useNotesStore } from '../stores/notes'
import { useProfileStore } from '../stores/profile'
import { NoteCard, NoteCardHandle } from './NoteCard'
import { TagDialog } from './TagDialog'
import { TagManagementDialog } from './TagManagementDialog'
import { CategoryFilter } from './CategoryFilter'
import { ViewModeSelector } from './ViewModeSelector'
import { SearchDialog } from './SearchDialog'
import { PinDialog, type PinDialogMode } from './PinDialog'
import { isCreateNoteShortcut, isSearchShortcut } from '../shortcuts/noteGlobal'
import { resolveNoteFeedShortcut } from '../shortcuts/noteFeed'
import { isOpenTagListShortcut, isOpenTagManagementShortcut } from '../shortcuts/tagList'
import { isToggleLockShortcut } from '../shortcuts/noteLock'
import { isDeleteShortcut, isArchiveShortcut, isRestoreShortcut } from '../shortcuts/noteTrash'
import { isTextInputTarget, getClosestNoteId } from '../lib/dom-utils'
import { extractInstagramUrls } from '../lib/instagram-url-utils'
import { extractYouTubeUrls } from '../lib/youtube-url-utils'
import { useDragAndDrop } from '../hooks'

// 큰 텍스트 임계값 (둘 다 충족해야 텍스트 첨부파일로 처리)
const LARGE_TEXT_THRESHOLD_LINES = 20
const LARGE_TEXT_THRESHOLD_CHARS = 1000

export function NoteFeed() {
  const {
    notes,
    createNote,
    deleteNote,
    addAttachment,
    createNoteWithInstagram,
    createNoteWithYouTube,
    filterTag,
    setFilterTag,
    categoryFilter,
    lockNote,
    temporarilyUnlockNote,
    temporarilyUnlockAll,
    hasLockedNotes,
    viewMode,
    trashedNotes,
    archivedNotes,
    restoreNote,
    permanentlyDeleteNote,
    emptyTrash,
    archiveNote,
    unarchiveNote,
    updateNotePriority,
    togglePinNote,
    selectedNoteId,
    selectNote,
    openBookSearchForLinking,
  } = useNotesStore()
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [tagDialogNoteId, setTagDialogNoteId] = useState<string | null>(null)
  const [showTagManagement, setShowTagManagement] = useState(false)
  const [pinDialogNoteId, setPinDialogNoteId] = useState<string | null>(null)
  const [pinDialogMode, setPinDialogMode] = useState<PinDialogMode>('setup')
  const [showUnlockAllDialog, setShowUnlockAllDialog] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const hasPin = useProfileStore((s) => s.hasPin)
  const cardRefs = useRef<Map<string, NoteCardHandle>>(new Map())
  const feedRef = useRef<HTMLDivElement>(null)

  // 이벤트 핸들러용 ref (의존성 분리) - 나중에 업데이트됨
  const focusedIndexRef = useRef<number | null>(focusedIndex)
  const orderedNotesRef = useRef<Array<{ note: Note; depth: number }>>([])
  const deleteNoteRef = useRef<(id: string) => void>(deleteNote)
  const handleReplyRef = useRef<(parentId: string) => Promise<void>>(() => Promise.resolve())
  const handleCreateSiblingRef = useRef<(parentId: string | null) => Promise<void>>(() =>
    Promise.resolve()
  )
  const updateNotePriorityRef =
    useRef<(id: string, priority: number) => Promise<void>>(updateNotePriority)
  const togglePinNoteRef = useRef<(id: string) => Promise<void>>(togglePinNote)
  const openBookSearchForLinkingRef = useRef<(noteId: string) => void>(openBookSearchForLinking)

  // 새 노트 생성 + 첨부물 추가 헬퍼 (useDragAndDrop에서 사용하기 위해 먼저 정의)
  const createNoteWithFile = useCallback(
    async (file: File) => {
      const note = await createNote()
      await addAttachment(note.id, file)
      setTimeout(() => {
        cardRefs.current.get(note.id)?.focus()
      }, 50)
    },
    [createNote, addAttachment]
  )

  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
    onDrop: async (files) => {
      for (const file of files) {
        await createNoteWithFile(file)
      }
    },
  })

  // 뷰 모드에 따른 노트 목록 선택
  const baseNotes = useMemo(() => {
    if (viewMode === 'trash') return trashedNotes
    if (viewMode === 'archived') return archivedNotes
    return notes
  }, [viewMode, notes, trashedNotes, archivedNotes])

  const filteredNotes = useMemo(() => {
    if (viewMode !== 'active') return baseNotes

    let result = filterTag
      ? baseNotes.filter((note) => note.tags.some((t) => t.name === filterTag))
      : baseNotes

    if (categoryFilter === 'link') {
      result = result.filter((note) => note.hasLink)
    } else if (categoryFilter === 'media') {
      result = result.filter((note) => note.hasMedia)
    } else if (categoryFilter === 'files') {
      result = result.filter((note) => note.hasFiles)
    }

    return result
  }, [viewMode, baseNotes, filterTag, categoryFilter])

  // flatNotes 계산 (메모이제이션)
  const flatNotes = useMemo(() => {
    const rootNotes = filteredNotes.filter((note) => note.parentId === null)

    const childrenMap = new Map<string, typeof filteredNotes>()
    for (const note of filteredNotes) {
      if (note.parentId) {
        const children = childrenMap.get(note.parentId) || []
        children.push(note)
        childrenMap.set(note.parentId, children)
      }
    }

    const flattenWithDepth = (
      noteList: typeof filteredNotes,
      depth: number
    ): Array<{ note: (typeof filteredNotes)[0]; depth: number }> => {
      const result: Array<{ note: (typeof filteredNotes)[0]; depth: number }> = []
      for (const note of noteList) {
        result.push({ note, depth })
        const children = childrenMap.get(note.id) || []
        const sortedChildren = [...children].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )
        result.push(...flattenWithDepth(sortedChildren, depth + 1))
      }
      return result
    }

    return flattenWithDepth(rootNotes, 0)
  }, [filteredNotes])

  // 답글 생성
  const handleReply = useCallback(
    async (parentId: string) => {
      const note = await createNote('', parentId)
      setTimeout(() => {
        cardRefs.current.get(note.id)?.focus()
      }, 50)
    },
    [createNote]
  )

  // 같은 레벨에 노트 생성 (형제 노트)
  const handleCreateSibling = useCallback(
    async (parentId: string | null) => {
      const note = await createNote('', parentId ?? undefined)
      setTimeout(() => {
        cardRefs.current.get(note.id)?.focus()
      }, 50)
    },
    [createNote]
  )

  // refs 업데이트 (이벤트 핸들러에서 최신 값 참조용)
  useEffect(() => {
    focusedIndexRef.current = focusedIndex
  }, [focusedIndex])

  useEffect(() => {
    deleteNoteRef.current = deleteNote
  }, [deleteNote])

  useEffect(() => {
    handleReplyRef.current = handleReply
  }, [handleReply])

  useEffect(() => {
    handleCreateSiblingRef.current = handleCreateSibling
  }, [handleCreateSibling])

  useEffect(() => {
    updateNotePriorityRef.current = updateNotePriority
  }, [updateNotePriority])

  useEffect(() => {
    togglePinNoteRef.current = togglePinNote
  }, [togglePinNote])

  useEffect(() => {
    openBookSearchForLinkingRef.current = openBookSearchForLinking
  }, [openBookSearchForLinking])

  const handleEscapeFromNormal = useCallback((index: number) => {
    setFocusedIndex(index)
    feedRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 텍스트 입력 영역에서 버블링된 이벤트 무시
    if (isTextInputTarget(e.target)) return

    // Escape로 포커스 해제 (피드에 직접 포커스가 있을 때만)
    if (e.key === 'Escape') {
      e.preventDefault()
      setFocusedIndex(null)
    }
  }, [])

  // grouped와 렌더링 순서에 맞는 orderedNotes를 함께 계산
  const { grouped, orderedNotes } = useMemo(() => {
    const groups: { date: string; items: typeof flatNotes }[] = []

    // Pinned 노트 분리 (root level만)
    const pinnedItems = flatNotes.filter((item) => item.depth === 0 && item.note.isPinned)
    const unpinnedItems = flatNotes.filter((item) => item.depth > 0 || !item.note.isPinned)

    // Pinned 그룹 추가 (pinnedAt 기준 내림차순 정렬)
    if (pinnedItems.length > 0) {
      const sortedPinned = [...pinnedItems].sort((a, b) => {
        const aTime = a.note.pinnedAt?.getTime() ?? 0
        const bTime = b.note.pinnedAt?.getTime() ?? 0
        return bTime - aTime
      })
      groups.push({ date: 'Pinned', items: sortedPinned })
    }

    // 일반 노트 날짜별 그룹화
    for (const item of unpinnedItems) {
      if (item.depth > 0 && groups.length > 0) {
        groups[groups.length - 1].items.push(item)
      } else {
        const date = new Date(item.note.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        const lastGroup = groups[groups.length - 1]
        if (lastGroup?.date === date) {
          lastGroup.items.push(item)
        } else {
          groups.push({ date, items: [item] })
        }
      }
    }

    // 렌더링 순서대로 평탄화 (네비게이션용)
    const ordered = groups.flatMap((g) => g.items)

    return { grouped: groups, orderedNotes: ordered }
  }, [flatNotes])

  // noteId -> index 맵 (O(1) 조회용) - orderedNotes 기준 (렌더링 순서)
  const noteIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    orderedNotes.forEach((item, index) => map.set(item.note.id, index))
    return map
  }, [orderedNotes])

  // orderedNotes ref 업데이트 (이벤트 핸들러에서 최신 값 참조용)
  useEffect(() => {
    orderedNotesRef.current = orderedNotes
  }, [orderedNotes])

  const cardElementRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const setCardRef = (id: string, handle: NoteCardHandle | null) => {
    if (handle) {
      cardRefs.current.set(id, handle)
    } else {
      cardRefs.current.delete(id)
    }
  }

  // 포커스된 카드로 스크롤 (requestAnimationFrame으로 최적화)
  useEffect(() => {
    if (focusedIndex === null) return
    const item = orderedNotes[focusedIndex]
    if (!item) return

    // requestAnimationFrame으로 스크롤 배치 처리
    const rafId = requestAnimationFrame(() => {
      const element = cardElementRefs.current.get(item.note.id)
      if (!element) return

      // getBoundingClientRect 사용하여 뷰포트 내 위치 확인
      const rect = element.getBoundingClientRect()
      const container = feedRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const isAbove = rect.top < containerRect.top + 60 // 헤더 고려
      const isBelow = rect.bottom > containerRect.bottom

      if (isAbove || isBelow) {
        element.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      }
    })

    return () => cancelAnimationFrame(rafId)
  }, [focusedIndex, orderedNotes])

  useEffect(() => {
    if (selectedNoteId) {
      const index = noteIndexMap.get(selectedNoteId)
      if (index !== undefined) {
        setFocusedIndex(index)
      }
      // Clear selectedNoteId after navigation to prevent unwanted focus jumps
      // when noteIndexMap changes (e.g., real-time updates)
      selectNote(null)
    }
  }, [selectedNoteId, noteIndexMap, selectNote])

  // 새 노트 생성 후 해당 노트 편집 모드로
  const handleCreateNote = useCallback(async () => {
    const note = await createNote()
    setTimeout(() => {
      cardRefs.current.get(note.id)?.focus()
    }, 50)
  }, [createNote])

  const handleSearchSelect = useCallback(
    (noteId: string) => {
      const index = noteIndexMap.get(noteId)
      if (index !== undefined) {
        setFocusedIndex(index)
        setTimeout(() => {
          const element = cardElementRefs.current.get(noteId)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 50)
      }
    },
    [noteIndexMap]
  )

  // n 단축키로 새 노트 생성 (텍스트 입력 중 제외)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return
      if (!isCreateNoteShortcut(e)) return
      e.preventDefault()
      handleCreateNote()
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleCreateNote])

  useEffect(() => {
    const handleSearchKeyDown = (e: KeyboardEvent) => {
      if (!isSearchShortcut(e)) return
      e.preventDefault()
      setShowSearchDialog(true)
    }

    window.addEventListener('keydown', handleSearchKeyDown)
    return () => window.removeEventListener('keydown', handleSearchKeyDown)
  }, [])

  // t 단축키로 노트별 태그 다이얼로그 열기 (텍스트 입력 중 제외)
  useEffect(() => {
    const handleTagListKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return
      if (!isOpenTagListShortcut(e)) return
      const fallbackNoteId = focusedIndex !== null ? orderedNotes[focusedIndex]?.note.id : null
      const noteId = getClosestNoteId(document.activeElement) ?? fallbackNoteId
      if (!noteId) return
      e.preventDefault()
      e.stopPropagation()
      setTagDialogNoteId(noteId)
    }

    window.addEventListener('keydown', handleTagListKeyDown)
    return () => window.removeEventListener('keydown', handleTagListKeyDown)
  }, [flatNotes, focusedIndex])

  // Cmd+T 단축키로 태그 관리 다이얼로그 열기
  useEffect(() => {
    const handleTagManagementKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return
      if (!isOpenTagManagementShortcut(e)) return
      e.preventDefault()
      e.stopPropagation()
      setShowTagManagement(true)
    }

    window.addEventListener('keydown', handleTagManagementKeyDown)
    return () => window.removeEventListener('keydown', handleTagManagementKeyDown)
  }, [])

  // Cmd+L 단축키로 노트 잠금 토글
  useEffect(() => {
    const handleLockKeyDown = (e: KeyboardEvent) => {
      if (!isToggleLockShortcut(e)) return
      const fallbackNoteId = focusedIndex !== null ? orderedNotes[focusedIndex]?.note.id : null
      const noteId = getClosestNoteId(document.activeElement) ?? fallbackNoteId
      if (!noteId) return
      e.preventDefault()
      e.stopPropagation()

      const note = notes.find((n) => n.id === noteId)
      if (!note) return

      // 잠금하려는데 PIN이 없으면 설정 다이얼로그 표시
      if (!note.isLocked && !hasPin) {
        setPinDialogMode('setup')
        setPinDialogNoteId(noteId)
        return
      }

      // 잠금 해제하려면 PIN 확인 필요 (일시 해제)
      if (note.isLocked) {
        setPinDialogMode('unlock-temp')
        setPinDialogNoteId(noteId)
        return
      }

      // 잠금 설정
      lockNote(noteId)
    }

    window.addEventListener('keydown', handleLockKeyDown)
    return () => window.removeEventListener('keydown', handleLockKeyDown)
  }, [flatNotes, focusedIndex, notes, hasPin, lockNote])

  // d 단축키로 삭제 (휴지통으로)
  useEffect(() => {
    const handleDeleteKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return
      if (!isDeleteShortcut(e)) return
      if (viewMode !== 'active') return

      const fallbackNoteId = focusedIndex !== null ? orderedNotes[focusedIndex]?.note.id : null
      const noteId = getClosestNoteId(document.activeElement) ?? fallbackNoteId
      if (!noteId) return

      e.preventDefault()
      e.stopPropagation()
      if (window.confirm('이 노트를 삭제하시겠습니까?')) {
        deleteNote(noteId)
      }
    }

    window.addEventListener('keydown', handleDeleteKeyDown)
    return () => window.removeEventListener('keydown', handleDeleteKeyDown)
  }, [flatNotes, focusedIndex, viewMode, deleteNote])

  // e 단축키로 보관
  useEffect(() => {
    const handleArchiveKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return
      if (!isArchiveShortcut(e)) return
      if (viewMode !== 'active') return

      const fallbackNoteId = focusedIndex !== null ? orderedNotes[focusedIndex]?.note.id : null
      const noteId = getClosestNoteId(document.activeElement) ?? fallbackNoteId
      if (!noteId) return

      e.preventDefault()
      e.stopPropagation()
      if (window.confirm('이 노트를 보관하시겠습니까?')) {
        archiveNote(noteId)
      }
    }

    window.addEventListener('keydown', handleArchiveKeyDown)
    return () => window.removeEventListener('keydown', handleArchiveKeyDown)
  }, [flatNotes, focusedIndex, viewMode, archiveNote])

  // r 단축키로 복원
  useEffect(() => {
    const handleRestoreKeyDown = (e: KeyboardEvent) => {
      if (isTextInputTarget(e.target)) return
      if (!isRestoreShortcut(e)) return

      const fallbackNoteId = focusedIndex !== null ? orderedNotes[focusedIndex]?.note.id : null
      const noteId = getClosestNoteId(document.activeElement) ?? fallbackNoteId
      if (!noteId) return

      e.preventDefault()
      e.stopPropagation()

      if (viewMode === 'trash') {
        restoreNote(noteId)
      } else if (viewMode === 'archived') {
        unarchiveNote(noteId)
      }
    }

    window.addEventListener('keydown', handleRestoreKeyDown)
    return () => window.removeEventListener('keydown', handleRestoreKeyDown)
  }, [flatNotes, focusedIndex, viewMode, restoreNote, unarchiveNote])

  // 초기 포커스
  useEffect(() => {
    feedRef.current?.focus()
  }, [])

  // 글로벌 j/k 네비게이션 (ref 패턴으로 의존성 분리)
  useEffect(() => {
    const handleGlobalNavigation = (e: KeyboardEvent) => {
      const currentOrderedNotes = orderedNotesRef.current
      const currentFocusedIndex = focusedIndexRef.current

      if (currentOrderedNotes.length === 0) return
      if (isTextInputTarget(e.target)) return

      // Cmd+B: 포커스된 노트에 책 연결 (다른 단축키보다 먼저 처리)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'b') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          openBookSearchForLinkingRef.current(item.note.id)
        }
        return
      }

      const action = resolveNoteFeedShortcut(e as unknown as React.KeyboardEvent)
      if (!action) return

      if (action === 'focusNext') {
        e.preventDefault()
        if (currentFocusedIndex === null) {
          setFocusedIndex(0)
        } else {
          const nextIndex = Math.min(currentFocusedIndex + 1, currentOrderedNotes.length - 1)
          setFocusedIndex(nextIndex)
        }
        feedRef.current?.focus()
        return
      }

      if (action === 'focusPrev') {
        e.preventDefault()
        if (currentFocusedIndex === null) {
          setFocusedIndex(currentOrderedNotes.length - 1)
        } else {
          const prevIndex = Math.max(currentFocusedIndex - 1, 0)
          setFocusedIndex(prevIndex)
        }
        feedRef.current?.focus()
        return
      }

      if (action === 'openFocused') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          cardRefs.current.get(item.note.id)?.focus()
          // Keep focusedIndex so navigation continues from this position after editing
        }
        return
      }

      if (action === 'deleteFocused') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item && window.confirm('이 노트를 삭제하시겠습니까?')) {
          deleteNoteRef.current(item.note.id)
          if (currentOrderedNotes.length > 1) {
            const nextIndex =
              currentFocusedIndex >= currentOrderedNotes.length - 1
                ? currentFocusedIndex - 1
                : currentFocusedIndex
            setFocusedIndex(nextIndex)
          } else {
            setFocusedIndex(null)
          }
        }
        return
      }

      if (action === 'replyToFocused') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          handleReplyRef.current(item.note.id)
          setFocusedIndex(null)
        }
        return
      }

      if (action === 'createSibling') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          // 현재 노트의 parentId를 사용하여 같은 레벨에 노트 생성
          handleCreateSiblingRef.current(item.note.parentId)
          setFocusedIndex(null)
        }
        return
      }

      if (action?.startsWith('setPriority')) {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          const priority = parseInt(action.slice(-1), 10)
          updateNotePriorityRef.current(item.note.id, priority)
        }
        return
      }

      if (action === 'copyFocused') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          navigator.clipboard.writeText(item.note.content)
        }
        return
      }

      if (action === 'togglePin') {
        if (currentFocusedIndex === null) return
        e.preventDefault()
        const item = currentOrderedNotes[currentFocusedIndex]
        if (item) {
          togglePinNoteRef.current(item.note.id)
        }
        return
      }
    }

    window.addEventListener('keydown', handleGlobalNavigation)
    return () => window.removeEventListener('keydown', handleGlobalNavigation)
  }, []) // 빈 의존성 - refs로 최신 값 참조

  // 글로벌 붙여넣기 -> 새 노트 생성 (에디터에 포커스 없을 때)
  useEffect(() => {
    const handlePaste = async (e: globalThis.ClipboardEvent) => {
      // 에디터에 포커스가 있으면 무시 (에디터가 직접 처리)
      if (isTextInputTarget(document.activeElement)) return

      const items = e.clipboardData?.items
      if (!items) return

      // 파일/이미지 처리
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (!file) continue

          e.preventDefault()
          await createNoteWithFile(file)
          return
        }
      }

      // 텍스트 처리
      const text = e.clipboardData?.getData('text/plain')
      if (text) {
        e.preventDefault()

        // Instagram URL 처리
        const instagramUrls = extractInstagramUrls(text)
        if (instagramUrls.length > 0) {
          for (const url of instagramUrls) {
            const note = await createNoteWithInstagram(url)
            if (note) {
              setTimeout(() => {
                cardRefs.current.get(note.id)?.focus()
              }, 50)
            }
          }
          return
        }

        // YouTube URL 처리
        const youtubeUrls = extractYouTubeUrls(text)
        if (youtubeUrls.length > 0) {
          for (const url of youtubeUrls) {
            const note = await createNoteWithYouTube(url)
            if (note) {
              setTimeout(() => {
                cardRefs.current.get(note.id)?.focus()
              }, 50)
            }
          }
          return
        }

        // 큰 텍스트는 텍스트 첨부파일로 처리 (둘 다 충족해야 함)
        const lineCount = text.split('\n').length
        const isLargeText =
          lineCount >= LARGE_TEXT_THRESHOLD_LINES && text.length >= LARGE_TEXT_THRESHOLD_CHARS

        if (isLargeText) {
          const firstLine = text.split('\n')[0].slice(0, 50)
          const title = firstLine || `붙여넣기 (${lineCount}줄)`
          const textFile = new File([text], `${title}.txt`, { type: 'text/plain' })
          await createNoteWithFile(textFile)
        } else {
          // 짧은 텍스트는 노트 본문으로
          const note = await createNote(text)
          setTimeout(() => {
            cardRefs.current.get(note.id)?.focus()
          }, 50)
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [createNote, createNoteWithFile, createNoteWithInstagram, createNoteWithYouTube])

  // 태그 다이얼로그에 전달할 현재 노트의 태그 목록 (필터링되지 않은 전체 notes에서 검색)
  const tagDialogNote = tagDialogNoteId ? notes.find((n) => n.id === tagDialogNoteId) : null
  const tagDialogExistingTags = tagDialogNote?.tags.map((t) => t.name) ?? []

  return (
    <div
      ref={feedRef}
      className={`feed ${isDragOver ? 'drag-over' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {tagDialogNoteId && (
        <TagDialog
          noteId={tagDialogNoteId}
          existingTagNames={tagDialogExistingTags}
          onClose={() => setTagDialogNoteId(null)}
        />
      )}
      {showTagManagement && (
        <TagManagementDialog onClose={() => setShowTagManagement(false)} />
      )}
      {showSearchDialog && (
        <SearchDialog
          onClose={() => setShowSearchDialog(false)}
          onSelectNote={handleSearchSelect}
        />
      )}
      {pinDialogNoteId && (
        <PinDialog
          mode={pinDialogMode}
          onSuccess={() => {
            const noteId = pinDialogNoteId
            setPinDialogNoteId(null)
            if (pinDialogMode === 'setup') {
              lockNote(noteId)
            } else if (pinDialogMode === 'unlock-temp') {
              temporarilyUnlockNote(noteId)
            }
          }}
          onCancel={() => setPinDialogNoteId(null)}
        />
      )}
      {showUnlockAllDialog && (
        <PinDialog
          mode="unlock-all"
          onSuccess={() => {
            setShowUnlockAllDialog(false)
            temporarilyUnlockAll()
          }}
          onCancel={() => setShowUnlockAllDialog(false)}
        />
      )}
      <div className="feed-header">
        <div className="feed-header-row">
          <ViewModeSelector />
          {viewMode === 'active' && (
            <>
              <div className="feed-header-divider" />
              <CategoryFilter />
              {filterTag && (
                <div className="filter-indicator">
                  <span>#{filterTag}</span>
                  <button onClick={() => setFilterTag(null)}>&times;</button>
                </div>
              )}
            </>
          )}
          <div className="feed-header-spacer" />
          {viewMode === 'active' && (
            <>
              {hasLockedNotes() && (
                <button
                  className="icon-btn"
                  onClick={() => setShowUnlockAllDialog(true)}
                  title="전체 잠금 해제"
                >
                  🔓
                </button>
              )}
              <button
                className="icon-btn"
                onClick={() => setShowSearchDialog(true)}
                title="검색 (⌘K)"
              >
                🔍
              </button>
            </>
          )}
          {viewMode === 'trash' && trashedNotes.length > 0 && (
            <button
              className="empty-trash-btn"
              onClick={() => {
                if (window.confirm('휴지통을 비우시겠습니까? 모든 노트가 영구 삭제됩니다.')) {
                  emptyTrash()
                }
              }}
            >
              비우기
            </button>
          )}
        </div>
      </div>
      <div className="feed-content">
        {grouped.map(({ date, items }) => (
          <div key={date} className="date-group">
            <div className="date-label">{date}</div>
            {items.map((item) => {
              const globalIndex = noteIndexMap.get(item.note.id) ?? -1
              return (
                <div
                  key={item.note.id}
                  ref={(el) => {
                    if (el) cardElementRefs.current.set(item.note.id, el)
                    else cardElementRefs.current.delete(item.note.id)
                  }}
                  onClick={() => setFocusedIndex(globalIndex)}
                >
                  <NoteCard
                    ref={(handle) => setCardRef(item.note.id, handle)}
                    note={item.note}
                    depth={item.depth}
                    viewMode={viewMode}
                    isFocused={focusedIndex === globalIndex}
                    onEscapeFromNormal={() => handleEscapeFromNormal(globalIndex)}
                    onReply={viewMode === 'active' ? handleReply : undefined}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
