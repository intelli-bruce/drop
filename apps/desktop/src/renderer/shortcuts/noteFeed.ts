import type { KeyEventLike } from './types'
import { isPrimaryModifier } from './matchers'

export type NoteFeedShortcutAction =
  | 'clearFocus'
  | 'focusNext'
  | 'focusPrev'
  | 'openFocused'
  | 'deleteFocused'
  | 'replyToFocused'
  | 'createSibling'
  | 'copyFocused'
  | 'setPriority0'
  | 'setPriority1'
  | 'setPriority2'
  | 'setPriority3'

export function resolveNoteFeedShortcut(event: KeyEventLike): NoteFeedShortcutAction | null {
  switch (event.key) {
    case 'Escape':
      return 'clearFocus'
    case 'ArrowDown':
    case 'j':
    case 'ㅓ': // 한글 j
      return 'focusNext'
    case 'ArrowUp':
    case 'k':
    case 'ㅏ': // 한글 k
      return 'focusPrev'
    case 'Enter':
      if (isPrimaryModifier(event)) {
        return 'createSibling'
      }
      if (event.shiftKey) {
        return 'replyToFocused'
      }
      return 'openFocused'
    case 'Delete':
    case 'Backspace':
      return 'deleteFocused'
    case 'c':
    case 'ㅊ': // 한글 c
      return 'copyFocused'
    case '0':
      return 'setPriority0'
    case '1':
      return 'setPriority1'
    case '2':
      return 'setPriority2'
    case '3':
      return 'setPriority3'
    default:
      return null
  }
}
