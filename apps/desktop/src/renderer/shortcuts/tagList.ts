import type { KeyEventLike } from './types'
import { isPrimaryModifier } from './matchers'

export const isOpenTagListShortcut = (event: KeyEventLike) =>
  isPrimaryModifier(event) && event.shiftKey && event.key.toLowerCase() === 't'
