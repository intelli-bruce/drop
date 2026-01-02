import type { KeyEventLike } from './types'
import { isPrimaryModifier } from './matchers'

export const isCreateNoteShortcut = (event: KeyEventLike) => event.key === 'n' || event.key === 'ㅜ'

export const isSearchShortcut = (event: KeyEventLike) =>
  isPrimaryModifier(event) && (event.key === 'k' || event.key === 'ㅏ')
