// PRD 3.2 Schema 기반 타입 정의

export type NoteSource = 'mobile' | 'desktop' | 'web'

export type AttachmentType = 'image' | 'audio' | 'video' | 'file' | 'text' | 'instagram' | 'youtube' | 'book'

// Database row types (snake_case - Supabase 컬럼명과 일치)
export interface NoteRow {
  id: string
  display_id: number
  content: string | null
  parent_id: string | null
  created_at: string
  updated_at: string
  source: NoteSource
  is_deleted: boolean
  user_id: string | null
  // 카테고리 플래그
  has_link: boolean
  has_media: boolean
  has_files: boolean
  // 잠금
  is_locked: boolean
  deleted_at: string | null
  archived_at: string | null
  priority: number
  // 상단 고정
  is_pinned: boolean
  pinned_at: string | null
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
  last_used_at: string | null
}

export interface NoteTagRow {
  note_id: string
  tag_id: string
}

export interface UserProfileRow {
  id: string
  user_id: string
  pin_hash: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  userId: string
  hasPin: boolean
  createdAt: Date
  updatedAt: Date
}

// Application types (camelCase - 앱 내부 사용)
export interface Note {
  id: string
  displayId: number
  content: string
  parentId: string | null
  attachments: Attachment[]
  tags: Tag[]
  createdAt: Date
  updatedAt: Date
  source: NoteSource
  isDeleted: boolean
  // 카테고리 플래그
  hasLink: boolean
  hasMedia: boolean
  hasFiles: boolean
  // 잠금
  isLocked: boolean
  deletedAt: Date | null
  archivedAt: Date | null
  priority: number
  // 상단 고정
  isPinned: boolean
  pinnedAt: Date | null
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
  lastUsedAt: Date | null
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
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
  }
}

export function noteRowToNote(
  row: NoteRow,
  attachments: Attachment[] = [],
  tags: Tag[] = []
): Note {
  return {
    id: row.id,
    displayId: row.display_id,
    content: row.content ?? '',
    parentId: row.parent_id,
    attachments,
    tags,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    source: row.source,
    isDeleted: row.is_deleted,
    hasLink: row.has_link,
    hasMedia: row.has_media,
    hasFiles: row.has_files,
    isLocked: row.is_locked,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    archivedAt: row.archived_at ? new Date(row.archived_at) : null,
    priority: row.priority ?? 0,
    isPinned: row.is_pinned ?? false,
    pinnedAt: row.pinned_at ? new Date(row.pinned_at) : null,
  }
}

export function userProfileRowToUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    hasPin: Boolean(row.pin_hash),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
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

// ============================================
// 알라딘 API 관련 타입
// ============================================

/**
 * 책 메타데이터 (attachments.metadata에 저장)
 */
export interface BookMetadata {
  // 식별자
  isbn: string // ISBN-10
  isbn13: string // ISBN-13 (주 식별자)
  itemId: number // 알라딘 상품 ID

  // 기본 정보
  title: string
  author: string
  publisher: string
  pubDate: string // YYYY-MM-DD
  description: string

  // 이미지
  cover: string // 원본 알라딘 URL (백업용)
  coverStoragePath?: string // Supabase Storage 경로

  // 가격
  priceStandard: number // 정가
  priceSales: number // 판매가

  // 분류
  categoryId?: number
  categoryName?: string
  mallType: string // BOOK, EBOOK, FOREIGN 등

  // 프리미엄 API 전용 (향후 확장)
  toc?: string // 목차
  fullDescription?: string // 전체 설명
  packing?: {
    pages: number
    sizeDepth: number // mm
    sizeHeight: number // mm
    sizeWidth: number // mm
    weight: number // g
  }

  // 시리즈 정보
  seriesInfo?: {
    seriesId: number
    seriesName: string
    seriesLink: string
  }

  // 알라딘 상품 페이지 링크 (필수 - 프리미엄 조건)
  link: string

  // 기타
  adult?: boolean // 성인 도서 여부
  stockStatus?: string // 재고 상태
  customerReviewRank?: number // 리뷰 평점 (0-10)
}

/**
 * 알라딘 검색 결과 아이템
 */
export interface AladinSearchResult {
  itemId: number
  title: string
  author: string
  publisher: string
  pubDate: string
  description: string
  isbn: string
  isbn13: string
  cover: string // 표지 URL
  priceStandard: number
  priceSales: number
  mallType: string
  link: string
  adult?: boolean
  stockStatus?: string
  categoryId?: number
  categoryName?: string
}

/**
 * 알라딘 상품 상세 조회 결과 (ItemLookUp API)
 */
export interface AladinBookDetail extends AladinSearchResult {
  // 부가 정보 (OptResult로 요청 시)
  customerReviewRank?: number
  bestRank?: number
  bestDuration?: string

  // 시리즈 정보
  seriesInfo?: {
    seriesId: number
    seriesName: string
    seriesLink: string
  }

  // 프리미엄 API 전용
  toc?: string
  fullDescription?: string
  packing?: {
    styleDesc?: string
    weight?: number
    sizeDepth?: number
    sizeHeight?: number
    sizeWidth?: number
  }
  subInfo?: {
    itemPage?: number
    subTitle?: string
    originalTitle?: string
  }
}

/**
 * 알라딘 API 검색 응답
 */
export interface AladinSearchResponse {
  version: string
  title: string
  link: string
  pubDate: string
  totalResults: number
  startIndex: number
  itemsPerPage: number
  query: string
  searchCategoryId?: number
  searchCategoryName?: string
  item: AladinSearchResult[]
}

/**
 * Book attachment 타입 가드
 */
export function isBookMetadata(
  metadata: unknown
): metadata is BookMetadata {
  if (!metadata || typeof metadata !== 'object') return false
  const m = metadata as Record<string, unknown>
  return (
    typeof m.isbn13 === 'string' &&
    typeof m.title === 'string' &&
    typeof m.link === 'string'
  )
}

/**
 * AladinSearchResult를 BookMetadata로 변환
 */
export function aladinResultToBookMetadata(
  result: AladinBookDetail,
  coverStoragePath?: string
): BookMetadata {
  return {
    isbn: result.isbn,
    isbn13: result.isbn13,
    itemId: result.itemId,
    title: result.title,
    author: result.author,
    publisher: result.publisher,
    pubDate: result.pubDate,
    description: result.description,
    cover: result.cover,
    coverStoragePath,
    priceStandard: result.priceStandard,
    priceSales: result.priceSales,
    categoryId: result.categoryId,
    categoryName: result.categoryName,
    mallType: result.mallType,
    toc: result.toc,
    fullDescription: result.fullDescription,
    packing: result.packing
      ? {
          pages: result.subInfo?.itemPage ?? 0,
          sizeDepth: result.packing.sizeDepth ?? 0,
          sizeHeight: result.packing.sizeHeight ?? 0,
          sizeWidth: result.packing.sizeWidth ?? 0,
          weight: result.packing.weight ?? 0,
        }
      : undefined,
    seriesInfo: result.seriesInfo,
    link: result.link,
    adult: result.adult,
    stockStatus: result.stockStatus,
    customerReviewRank: result.customerReviewRank,
  }
}
