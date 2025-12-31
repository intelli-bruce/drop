import type { Attachment, AttachmentType } from '@drop/shared'
import { hasUrlInText } from './url-utils'

// 미디어 타입 정의
const MEDIA_TYPES: AttachmentType[] = ['image', 'video', 'audio']
const FILE_TYPES: AttachmentType[] = ['file', 'text']
const LINK_TYPES: AttachmentType[] = ['instagram', 'youtube']

export interface NoteCategories {
  hasLink: boolean
  hasMedia: boolean
  hasFiles: boolean
}

/**
 * 노트 컨텐츠와 첨부파일을 기반으로 카테고리 계산
 */
export function calculateNoteCategories(
  content: string | null,
  attachments: Attachment[]
): NoteCategories {
  // 1. has_link: 본문에 URL이 있거나 instagram/youtube 첨부파일이 있는 경우
  const hasLinkInContent = hasUrlInText(content ?? '')
  const hasLinkAttachment = attachments.some((a) => LINK_TYPES.includes(a.type))
  const hasLink = hasLinkInContent || hasLinkAttachment

  // 2. has_media: image, video, audio 첨부파일이 있는 경우
  const hasMedia = attachments.some((a) => MEDIA_TYPES.includes(a.type))

  // 3. has_files: file, text 첨부파일이 있는 경우
  const hasFiles = attachments.some((a) => FILE_TYPES.includes(a.type))

  return { hasLink, hasMedia, hasFiles }
}

/**
 * 기존 카테고리와 새 카테고리 비교
 */
export function categoriesChanged(
  existing: NoteCategories,
  updated: NoteCategories
): boolean {
  return (
    existing.hasLink !== updated.hasLink ||
    existing.hasMedia !== updated.hasMedia ||
    existing.hasFiles !== updated.hasFiles
  )
}
