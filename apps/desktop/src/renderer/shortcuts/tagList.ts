import type { KeyEventLike } from './types'
import { isPrimaryModifier } from './matchers'

// t 키로 노트별 태그 추가 다이얼로그
export const isOpenTagListShortcut = (event: KeyEventLike) =>
  (event.key === 't' || event.key === 'ㅅ') && !isPrimaryModifier(event)

// Cmd+T 키로 태그 관리 다이얼로그
export const isOpenTagManagementShortcut = (event: KeyEventLike) =>
  (event.key === 't' || event.key === 'ㅅ') && isPrimaryModifier(event)
