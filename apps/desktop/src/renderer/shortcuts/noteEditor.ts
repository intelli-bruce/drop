import type { KeyEventLike } from './types'

export type NoteEditorShortcutAction = 'escape'

export function resolveNoteEditorShortcut(event: KeyEventLike): NoteEditorShortcutAction | null {
  if (event.key === 'Escape') return 'escape'
  return null
}
