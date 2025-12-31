import type { KeyEventLike } from './types'

export const isOpenTagListShortcut = (event: KeyEventLike) =>
  event.key === 't' || event.key === 'ㅅ'
