/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { isTextInputTarget, getClosestNoteId } from '../dom-utils'

describe('isTextInputTarget', () => {
  it('should return true for INPUT elements', () => {
    const input = document.createElement('input')
    expect(isTextInputTarget(input)).toBe(true)
  })

  it('should return true for TEXTAREA elements', () => {
    const textarea = document.createElement('textarea')
    expect(isTextInputTarget(textarea)).toBe(true)
  })

  it('should return true for contenteditable elements', () => {
    const div = document.createElement('div')
    div.contentEditable = 'true'
    expect(isTextInputTarget(div)).toBe(true)
  })

  it('should return true for elements inside contenteditable', () => {
    const container = document.createElement('div')
    container.setAttribute('contenteditable', 'true')
    const span = document.createElement('span')
    container.appendChild(span)
    document.body.appendChild(container)

    expect(isTextInputTarget(span)).toBe(true)

    document.body.removeChild(container)
  })

  it('should return false for regular div elements', () => {
    const div = document.createElement('div')
    expect(isTextInputTarget(div)).toBe(false)
  })

  it('should return false for button elements', () => {
    const button = document.createElement('button')
    expect(isTextInputTarget(button)).toBe(false)
  })

  it('should return false for null', () => {
    expect(isTextInputTarget(null)).toBe(false)
  })

  it('should return false for non-HTMLElement event targets', () => {
    const textNode = document.createTextNode('text')
    expect(isTextInputTarget(textNode as unknown as EventTarget)).toBe(false)
  })
})

describe('getClosestNoteId', () => {
  it('should return note ID from element with data-note-id', () => {
    const div = document.createElement('div')
    div.dataset.noteId = 'note-123'
    expect(getClosestNoteId(div)).toBe('note-123')
  })

  it('should return note ID from ancestor element', () => {
    const container = document.createElement('div')
    container.dataset.noteId = 'note-456'
    const child = document.createElement('span')
    container.appendChild(child)
    document.body.appendChild(container)

    expect(getClosestNoteId(child)).toBe('note-456')

    document.body.removeChild(container)
  })

  it('should return null when no data-note-id is found', () => {
    const div = document.createElement('div')
    expect(getClosestNoteId(div)).toBeNull()
  })

  it('should return null for null target', () => {
    expect(getClosestNoteId(null)).toBeNull()
  })

  it('should return null for non-HTMLElement event targets', () => {
    const textNode = document.createTextNode('text')
    expect(getClosestNoteId(textNode as unknown as EventTarget)).toBeNull()
  })

  it('should return closest note ID when nested', () => {
    const outer = document.createElement('div')
    outer.dataset.noteId = 'outer-note'
    const inner = document.createElement('div')
    inner.dataset.noteId = 'inner-note'
    const deepChild = document.createElement('span')
    inner.appendChild(deepChild)
    outer.appendChild(inner)
    document.body.appendChild(outer)

    // Should return the closest (inner) note ID
    expect(getClosestNoteId(deepChild)).toBe('inner-note')

    document.body.removeChild(outer)
  })
})
