import type { KeyEventLike } from './types'

// d 또는 ㅇ: 삭제 (휴지통으로)
export const isDeleteShortcut = (event: KeyEventLike) =>
  !event.metaKey && !event.ctrlKey && !event.altKey && (event.key === 'd' || event.key === 'ㅇ')

// e 또는 ㄷ: 보관
export const isArchiveShortcut = (event: KeyEventLike) =>
  !event.metaKey && !event.ctrlKey && !event.altKey && (event.key === 'e' || event.key === 'ㄷ')

// r 또는 ㄱ: 복원
export const isRestoreShortcut = (event: KeyEventLike) =>
  !event.metaKey && !event.ctrlKey && !event.altKey && (event.key === 'r' || event.key === 'ㄱ')
