import type { KeyEventLike } from './types'

export const isToggleLockShortcut = (event: KeyEventLike) =>
  event.metaKey && (event.key === 'l' || event.key === 'ㅣ')
