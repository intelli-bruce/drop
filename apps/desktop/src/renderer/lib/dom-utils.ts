/**
 * Check if the event target is a text input element
 * (input, textarea, or contenteditable)
 */
export function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  // Check isContentEditable or contentEditable attribute directly
  if (target.isContentEditable || target.contentEditable === 'true') return true
  const tagName = target.tagName
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') return true
  return Boolean(target.closest('[contenteditable="true"]'))
}

/**
 * Get the note ID from the closest ancestor with data-note-id attribute
 */
export function getClosestNoteId(target: EventTarget | null): string | null {
  if (!(target instanceof HTMLElement)) return null
  const noteElement = target.closest<HTMLElement>('[data-note-id]')
  return noteElement?.dataset.noteId ?? null
}
