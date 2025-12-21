import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view'
import { EditorState, Range } from '@codemirror/state'

// Hide decoration (makes text invisible but keeps cursor positions)
const hideDecoration = Decoration.mark({ class: 'cm-hide' })

function getDecorations(state: EditorState, cursorLine: number): DecorationSet {
  const decorations: Range<Decoration>[] = []
  const doc = state.doc

  for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
    // Skip the line where cursor is
    if (lineNum === cursorLine) continue

    const line = doc.line(lineNum)
    const lineText = line.text

    // Bold: **text** or __text__
    const boldRegex = /(\*\*|__)(.+?)\1/g
    let match
    while ((match = boldRegex.exec(lineText)) !== null) {
      const start = line.from + match.index
      const markerLen = match[1].length
      // Hide opening marker
      decorations.push(hideDecoration.range(start, start + markerLen))
      // Style the content
      decorations.push(
        Decoration.mark({ class: 'cm-strong' }).range(
          start + markerLen,
          start + markerLen + match[2].length
        )
      )
      // Hide closing marker
      decorations.push(
        hideDecoration.range(
          start + markerLen + match[2].length,
          start + match[0].length
        )
      )
    }

    // Italic: *text* or _text_ (not preceded by * or _)
    const italicRegex = /(?<![*_])([*_])(?![*_])(.+?)(?<![*_])\1(?![*_])/g
    while ((match = italicRegex.exec(lineText)) !== null) {
      const start = line.from + match.index
      decorations.push(hideDecoration.range(start, start + 1))
      decorations.push(
        Decoration.mark({ class: 'cm-em' }).range(start + 1, start + 1 + match[2].length)
      )
      decorations.push(hideDecoration.range(start + match[0].length - 1, start + match[0].length))
    }

    // Inline code: `code`
    const codeRegex = /`([^`]+)`/g
    while ((match = codeRegex.exec(lineText)) !== null) {
      const start = line.from + match.index
      decorations.push(hideDecoration.range(start, start + 1))
      decorations.push(
        Decoration.mark({ class: 'cm-inline-code' }).range(start + 1, start + 1 + match[1].length)
      )
      decorations.push(hideDecoration.range(start + match[0].length - 1, start + match[0].length))
    }

    // Strikethrough: ~~text~~
    const strikeRegex = /~~(.+?)~~/g
    while ((match = strikeRegex.exec(lineText)) !== null) {
      const start = line.from + match.index
      decorations.push(hideDecoration.range(start, start + 2))
      decorations.push(
        Decoration.mark({ class: 'cm-strikethrough' }).range(start + 2, start + 2 + match[1].length)
      )
      decorations.push(hideDecoration.range(start + match[0].length - 2, start + match[0].length))
    }

    // Headers: # ## ### etc.
    const headerMatch = lineText.match(/^(#{1,6})\s/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const start = line.from
      // Hide the # symbols and space
      decorations.push(hideDecoration.range(start, start + level + 1))
      // Style the rest of the line
      decorations.push(
        Decoration.mark({ class: `cm-header cm-header-${level}` }).range(
          start + level + 1,
          line.to
        )
      )
    }

    // Links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    while ((match = linkRegex.exec(lineText)) !== null) {
      const start = line.from + match.index
      const textStart = start + 1
      const textEnd = textStart + match[1].length
      // Hide [
      decorations.push(hideDecoration.range(start, start + 1))
      // Style link text
      decorations.push(Decoration.mark({ class: 'cm-link' }).range(textStart, textEnd))
      // Hide ](url)
      decorations.push(hideDecoration.range(textEnd, start + match[0].length))
    }
  }

  // Sort decorations by position
  decorations.sort((a, b) => a.from - b.from || a.to - b.to)

  return Decoration.set(decorations, true)
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number
      this.decorations = getDecorations(view.state, cursorLine)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        const cursorLine = update.state.doc.lineAt(update.state.selection.main.head).number
        this.decorations = getDecorations(update.state, cursorLine)
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)

export const livePreviewTheme = EditorView.baseTheme({
  '.cm-hide': {
    fontSize: '0',
    width: '0',
    display: 'inline-block',
    overflow: 'hidden',
  },
  '.cm-strong': {
    fontWeight: 'bold',
  },
  '.cm-em': {
    fontStyle: 'italic',
  },
  '.cm-inline-code': {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '1px 4px',
    borderRadius: '3px',
  },
  '.cm-strikethrough': {
    textDecoration: 'line-through',
  },
  '.cm-header': {
    fontWeight: 'bold',
  },
  '.cm-header-1': {
    fontSize: '1.6em',
  },
  '.cm-header-2': {
    fontSize: '1.4em',
  },
  '.cm-header-3': {
    fontSize: '1.2em',
  },
  '.cm-header-4, .cm-header-5, .cm-header-6': {
    fontSize: '1.1em',
  },
  '.cm-link': {
    color: '#4a9eff',
    textDecoration: 'underline',
  },
})
