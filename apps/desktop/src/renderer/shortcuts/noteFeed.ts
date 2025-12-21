import type { KeyEventLike } from './types'

export type NoteFeedShortcutAction =
  | 'clearFocus'
  | 'focusNext'
  | 'focusPrev'
  | 'openFocused'
  | 'deleteFocused'

export function resolveNoteFeedShortcut(event: KeyEventLike): NoteFeedShortcutAction | null {
  switch (event.key) {
    case 'Escape':
      return 'clearFocus'
    case 'ArrowDown':
    case 'j':
      return 'focusNext'
    case 'ArrowUp':
    case 'k':
      return 'focusPrev'
    case 'Enter':
      return 'openFocused'
    case 'Delete':
    case 'Backspace':
      return 'deleteFocused'
    default:
      return null
  }
}
