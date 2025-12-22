import { useEffect, useState } from 'react'
import { FileIcon, defaultStyles } from 'react-file-icon'
import type { Attachment } from '@throw/shared'
import { getAttachmentUrl, getSignedAttachmentUrl } from '../lib/supabase'

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

function useAttachmentUrl(storagePath: string) {
  const [url, setUrl] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const signed = await getSignedAttachmentUrl(storagePath)
      if (cancelled) return
      if (signed) {
        setUrl(signed)
        return
      }
      setUrl(getAttachmentUrl(storagePath))
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [storagePath, retryCount])

  const retry = () => setRetryCount((c) => c + 1)

  return { url, retry }
}

function ImageAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { url, retry } = useAttachmentUrl(attachment.storagePath)

  const handleError = () => {
    console.error('[attachments] image load failed', {
      attachmentId: attachment.id,
      storagePath: attachment.storagePath,
      url,
    })
    setHasError(true)
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHasError(false)
    retry()
  }

  return (
    <div className="attachment-card attachment-image">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div className="attachment-thumbnail" onClick={() => !hasError && setExpanded(!expanded)}>
        {hasError ? (
          <div className="attachment-error" onClick={handleRetry}>
            <span>로드 실패</span>
            <button>재시도</button>
          </div>
        ) : url ? (
          <img src={url} alt={attachment.filename || '이미지'} onError={handleError} />
        ) : (
          <span className="attachment-placeholder">로딩 중</span>
        )}
      </div>
      {expanded && url && !hasError ? (
        <div className="attachment-modal" onClick={() => setExpanded(false)}>
          <img src={url} alt={attachment.filename || '이미지'} onError={handleError} />
        </div>
      ) : null}
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
  const [hasError, setHasError] = useState(false)
  const { url, retry } = useAttachmentUrl(attachment.storagePath)

  const handleRetry = () => {
    setHasError(false)
    retry()
  }

  return (
    <div className="attachment-card attachment-video">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      {hasError ? (
        <div className="attachment-error" onClick={handleRetry}>
          <span>로드 실패</span>
          <button>재시도</button>
        </div>
      ) : url ? (
        <video
          className="attachment-video-player"
          controls
          src={url}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="attachment-placeholder">로딩 중</span>
      )}
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
  const [hasError, setHasError] = useState(false)
  const { url, retry } = useAttachmentUrl(attachment.storagePath)

  const handleRetry = () => {
    setHasError(false)
    retry()
  }

  return (
    <div className="attachment-card attachment-audio">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      {hasError ? (
        <div className="attachment-error" onClick={handleRetry}>
          <span>로드 실패</span>
          <button>재시도</button>
        </div>
      ) : url ? (
        <audio
          className="attachment-audio-player"
          controls
          src={url}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="attachment-placeholder">로딩 중</span>
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
  const { url } = useAttachmentUrl(attachment.storagePath)

  const handleDownload = () => {
    if (!url) return
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

function TextAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const { url } = useAttachmentUrl(attachment.storagePath)

  useEffect(() => {
    if (!url) return
    fetch(url)
      .then((res) => res.text())
      .then(setContent)
      .catch(() => setContent(null))
  }, [url])

  const lineCount = content?.split('\n').length ?? 0
  const preview = content?.split('\n').slice(0, 3).join('\n') ?? ''

  return (
    <div className="attachment-card attachment-text">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div className="attachment-text-content" onClick={() => setExpanded(true)}>
        <div className="attachment-text-header">
          <span className="attachment-text-icon">📄</span>
          <span className="attachment-text-name">{attachment.filename || '텍스트'}</span>
          <span className="attachment-text-meta">{lineCount}줄 · {formatFileSize(attachment.size)}</span>
        </div>
        <pre className="attachment-text-preview">{preview}{lineCount > 3 ? '\n...' : ''}</pre>
      </div>
      {expanded && content ? (
        <div className="attachment-modal" onClick={() => setExpanded(false)}>
          <div className="attachment-text-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="attachment-text-dialog-header">
              {attachment.filename || '텍스트'}
              <button onClick={() => setExpanded(false)}>×</button>
            </div>
            <pre className="attachment-text-full">{content}</pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function InstagramAttachment({
  attachment,
  onRemove,
}: {
  attachment: Attachment
  onRemove: () => void
}) {
  const isLoading = attachment.metadata?.loading === true
  const { url, retry } = useAttachmentUrl(attachment.storagePath)
  const [expanded, setExpanded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const caption = attachment.caption?.trim()
  const authorName = attachment.authorName?.trim()
  const originalUrl = attachment.originalUrl
  const authorUrl = attachment.authorUrl
  const metadata = {
    originalUrl,
    authorName,
    authorUrl,
    caption,
    ...(attachment.metadata ?? {}),
  }
  const metadataText = JSON.stringify(metadata, null, 2)

  const openUrl = (target?: string) => {
    if (!target) return
    window.open(target, '_blank')
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHasError(false)
    retry()
  }

  // 로딩 중인 경우 skeleton 표시
  if (isLoading) {
    return (
      <div className="attachment-card attachment-instagram attachment-loading">
        <div className="attachment-instagram-content">
          <div className="attachment-instagram-thumbnail">
            <div className="attachment-skeleton" />
          </div>
          <div className="attachment-instagram-info">
            <div className="attachment-instagram-header">
              <span className="attachment-instagram-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2.5A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5H7zm10.5 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z" />
                </svg>
              </span>
              <span className="attachment-instagram-label">Instagram</span>
            </div>
            <span className="attachment-skeleton-text" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="attachment-card attachment-instagram">
      <button className="attachment-remove" onClick={onRemove}>×</button>
      <div className="attachment-instagram-content" onClick={() => !hasError && setExpanded(true)}>
        <div className="attachment-instagram-thumbnail">
          {hasError ? (
            <div className="attachment-error" onClick={handleRetry}>
              <span>로드 실패</span>
              <button>재시도</button>
            </div>
          ) : url ? (
            <img
              src={url}
              alt={attachment.filename || 'Instagram'}
              onError={() => setHasError(true)}
            />
          ) : (
            <span className="attachment-placeholder">로딩 중</span>
          )}
        </div>
        <div className="attachment-instagram-info">
          <div className="attachment-instagram-header">
            <span className="attachment-instagram-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2.5A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5H7zm10.5 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z" />
              </svg>
            </span>
            <span className="attachment-instagram-label">Instagram</span>
          </div>
          {authorName ? (
            <span
              className="attachment-instagram-author"
              onClick={(event) => {
                event.stopPropagation()
                openUrl(authorUrl ?? originalUrl)
              }}
            >
              @{authorName}
            </span>
          ) : null}
          {caption ? <p className="attachment-instagram-caption">{caption}</p> : null}
          {originalUrl ? (
            <span
              className="attachment-instagram-hint"
              onClick={(event) => {
                event.stopPropagation()
                openUrl(originalUrl)
              }}
            >
              원본 보기
            </span>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className="attachment-modal" onClick={() => setExpanded(false)}>
          <div
            className="attachment-instagram-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="attachment-instagram-dialog-header">Instagram 파싱 데이터</div>
            <pre className="attachment-instagram-json">{metadataText}</pre>
          </div>
        </div>
      ) : null}
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
          case 'text':
            return (
              <TextAttachment
                key={attachment.id}
                attachment={attachment}
                onRemove={() => onRemove(attachment.id)}
              />
            )
          case 'instagram':
            return (
              <InstagramAttachment
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
