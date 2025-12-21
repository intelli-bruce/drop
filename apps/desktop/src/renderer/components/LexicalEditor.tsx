import { forwardRef, useImperativeHandle, useEffect, useCallback, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown'
import { EditorState, $getRoot, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical'
import { resolveNoteEditorShortcut } from '../shortcuts/noteEditor'

export interface LexicalEditorHandle {
  focus: () => void
}

interface Props {
  initialContent: string
  onChange: (content: string) => void
  onEscape: () => void
  onAddFile: (file: File) => void
}

const theme = {
  paragraph: 'lexical-paragraph',
  text: {
    bold: 'lexical-bold',
    italic: 'lexical-italic',
    strikethrough: 'lexical-strikethrough',
    underline: 'lexical-underline',
    code: 'lexical-code',
  },
  heading: {
    h1: 'lexical-h1',
    h2: 'lexical-h2',
    h3: 'lexical-h3',
  },
  list: {
    ul: 'lexical-ul',
    ol: 'lexical-ol',
    listitem: 'lexical-li',
  },
  quote: 'lexical-quote',
  code: 'lexical-code-block',
  link: 'lexical-link',
}

function EscapePlugin({ onEscape }: { onEscape: () => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const action = resolveNoteEditorShortcut(e)
      if (action !== 'escape') return
      e.preventDefault()
      rootElement.blur()
      onEscape()
    }

    rootElement.addEventListener('keydown', handleKeyDown)
    return () => rootElement.removeEventListener('keydown', handleKeyDown)
  }, [editor, onEscape])

  return null
}

function FocusPlugin({
  editorRef,
}: {
  editorRef: React.MutableRefObject<{ focus: () => void } | null>
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editorRef.current = {
      focus: () => editor.focus(),
    }
    return () => {
      editorRef.current = null
    }
  }, [editor, editorRef])

  return null
}

function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()
  const lastAppliedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!content) return

    editor.update(() => {
      const root = $getRoot()
      const hasUserContent = root.getTextContent().length > 0
      const isDuplicate = lastAppliedRef.current === content

      if (hasUserContent && !isDuplicate) return

      root.clear()
      $convertFromMarkdownString(content, TRANSFORMERS)
      lastAppliedRef.current = content
    })
  }, [content, editor])

  return null
}

function FilePastePlugin({ onAddFile }: { onAddFile: (file: File) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const items = event.clipboardData?.items
        if (!items) return false

        // 파일 처리 (이미지 포함)
        for (const item of items) {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            if (!file) continue

            event.preventDefault()
            onAddFile(file)
            return true
          }
        }

        return false
      },
      COMMAND_PRIORITY_HIGH
    )
  }, [editor, onAddFile])

  return null
}

export const LexicalEditor = forwardRef<LexicalEditorHandle, Props>(
  ({ initialContent, onChange, onEscape, onAddFile }, ref) => {
    const editorRef = { current: null as { focus: () => void } | null }

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
    }))

    const handleChange = useCallback(
      (editorState: EditorState) => {
        editorState.read(() => {
          const root = $getRoot()
          if (root.getTextContent().length === 0 && root.getChildrenSize() <= 1) {
            onChange('')
            return
          }

          const markdown = $convertToMarkdownString(TRANSFORMERS)
          onChange(markdown)
        })
      },
      [onChange]
    )

    const initialConfig = {
      namespace: 'NoteEditor',
      theme,
      onError: (error: Error) => console.error(error),
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
    }

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className="lexical-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="lexical-content" />}
            placeholder={<div className="lexical-placeholder">메모 작성...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <OnChangePlugin onChange={handleChange} />
          <FilePastePlugin onAddFile={onAddFile} />
          <EscapePlugin onEscape={onEscape} />
          <FocusPlugin editorRef={editorRef} />
          <InitialContentPlugin content={initialContent} />
        </div>
      </LexicalComposer>
    )
  }
)

LexicalEditor.displayName = 'LexicalEditor'
