import { useState } from 'react'
import { FileIcon, defaultStyles } from 'react-file-icon'
import type { Attachment } from '@throw/shared'

interface Props {
  attachments: Attachment[]
  onRemove: (attachmentId: string) => void
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExtension(filename?: string, mimeType?: string): string {
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext) return ext
  }
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('word')) return 'docx'
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xlsx'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx'
    if (mimeType.startsWith('video/')) return 'mp4'
    if (mimeType.startsWith('audio/')) return 'mp3'
    if (mimeType.includes('zip')) return 'zip'
    if (mimeType.includes('json')) return 'json'
    if (mimeType.startsWith('text/')) return 'txt'
  }
  return 'file'
}

function ImageAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="attachment-card attachment-image">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div
        className="attachment-thumbnail"
        onClick={() => setExpanded(!expanded)}
      >
        <img src={attachment.data} alt={attachment.title || '이미지'} />
      </div>
      {expanded && (
        <div className="attachment-modal" onClick={() => setExpanded(false)}>
          <img src={attachment.data} alt={attachment.title || '이미지'} />
        </div>
      )}
    </div>
  )
}

function TextBlockAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const lineCount = attachment.data.split('\n').length
  const charCount = attachment.data.length
  const preview = attachment.data.split('\n').slice(0, 3).join('\n')

  return (
    <div className="attachment-card attachment-text-block">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div
        className="attachment-text-preview"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="attachment-text-header">
          <div className="attachment-text-icon">
            <FileIcon extension="txt" {...defaultStyles.txt} />
          </div>
          <span className="attachment-text-meta">{lineCount}줄 · {charCount}자</span>
        </div>
        <pre className="attachment-text-snippet">{preview}</pre>
        {!expanded && lineCount > 3 && (
          <div className="attachment-text-fade" />
        )}
      </div>
      {expanded && (
        <div className="attachment-text-full">
          <pre>{attachment.data}</pre>
        </div>
      )}
    </div>
  )
}

function FileAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = attachment.data
    link.download = attachment.title || 'download'
    link.click()
  }

  const ext = getExtension(attachment.title, attachment.mimeType)
  const styles = defaultStyles[ext as keyof typeof defaultStyles] || {}

  return (
    <div className="attachment-card attachment-file">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div className="attachment-file-content" onClick={handleDownload}>
        <div className="attachment-file-icon">
          <FileIcon extension={ext} {...styles} />
        </div>
        <div className="attachment-file-info">
          <span className="attachment-file-name">{attachment.title || '파일'}</span>
          <span className="attachment-file-size">{formatFileSize(attachment.size)}</span>
        </div>
      </div>
    </div>
  )
}

export function AttachmentList({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null

  return (
    <div className="attachment-list">
      {attachments.map((attachment) => {
        switch (attachment.type) {
          case 'image':
            return (
              <ImageAttachment
                key={attachment.id}
                attachment={attachment}
                onRemove={() => onRemove(attachment.id)}
              />
            )
          case 'text-block':
            return (
              <TextBlockAttachment
                key={attachment.id}
                attachment={attachment}
                onRemove={() => onRemove(attachment.id)}
              />
            )
          case 'file':
            return (
              <FileAttachment
                key={attachment.id}
                attachment={attachment}
                onRemove={() => onRemove(attachment.id)}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
