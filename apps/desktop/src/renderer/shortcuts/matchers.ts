import type { KeyEventLike } from './types'

export const isPrimaryModifier = (event: KeyEventLike) => event.metaKey || event.ctrlKey
