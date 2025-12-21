import { useState } from 'react'
import { FileIcon, defaultStyles } from 'react-file-icon'
import type { Attachment } from '@throw/shared'
import { getAttachmentUrl } from '../lib/supabase'

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
  const url = getAttachmentUrl(attachment.storagePath)

  return (
    <div className="attachment-card attachment-image">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div className="attachment-thumbnail" onClick={() => setExpanded(!expanded)}>
        <img src={url} alt={attachment.filename || '이미지'} />
      </div>
      {expanded && (
        <div className="attachment-modal" onClick={() => setExpanded(false)}>
          <img src={url} alt={attachment.filename || '이미지'} />
        </div>
      )}
    </div>
  )
}

function VideoAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const url = getAttachmentUrl(attachment.storagePath)

  return (
    <div className="attachment-card attachment-video">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <video className="attachment-video-player" controls src={url} />
    </div>
  )
}

function AudioAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const url = getAttachmentUrl(attachment.storagePath)

  return (
    <div className="attachment-card attachment-audio">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <audio className="attachment-audio-player" controls src={url} />
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
  const url = getAttachmentUrl(attachment.storagePath)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.filename || 'download'
    link.click()
  }

  const ext = getExtension(attachment.filename, attachment.mimeType)
  const styles = defaultStyles[ext as keyof typeof defaultStyles] || {}

  return (
    <div className="attachment-card attachment-file">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div className="attachment-file-content" onClick={handleDownload}>
        <div className="attachment-file-icon">
          <FileIcon extension={ext} {...styles} />
        </div>
        <div className="attachment-file-info">
          <span className="attachment-file-name">{attachment.filename || '파일'}</span>
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
          case 'video':
            return (
              <VideoAttachment
                key={attachment.id}
                attachment={attachment}
                onRemove={() => onRemove(attachment.id)}
              />
            )
          case 'audio':
            return (
              <AudioAttachment
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
