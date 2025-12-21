import type { KeyEventLike } from './types'
import { isPrimaryModifier } from './matchers'

export const isCreateNoteShortcut = (event: KeyEventLike) =>
  isPrimaryModifier(event) && event.key === 'n'
