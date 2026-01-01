import type { KeyEventLike } from './types'

export const isCreateNoteShortcut = (event: KeyEventLike) =>
  event.key === 'n' || event.key === 'ㅜ'
