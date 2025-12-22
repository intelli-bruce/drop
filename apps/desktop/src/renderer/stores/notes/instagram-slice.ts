/// <reference path="../../../preload/index.d.ts" />
import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { fileFromDataUrl, extensionFromMime, normalizeExternalUrl } from '../../lib/file-utils'
import { attachmentRowToAttachment } from '@throw/shared'
import type { AttachmentRow, Attachment } from '@throw/shared'
import type { NotesState, InstagramSlice } from './types'

interface InstagramMediaItem {
  displayUrl?: string
  videoUrl?: string
  typename?: string
}

export const createInstagramSlice: StateCreator<NotesState, [], [], InstagramSlice> = (
  set,
  get
) => ({
  createNoteWithInstagram: async (url) => {
    const match = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/)
    const shortcode = match ? match[1] : null
    if (!shortcode) return null

    console.info('[instagram] createNoteWithInstagram start', { url, shortcode })
    const note = await get().createNote()
    console.info('[instagram] note created', { noteId: note.id })

    // 로딩 중 표시를 위한 임시 skeleton attachment 추가
    const skeletonId = `skeleton-${shortcode}`
    const skeletonAttachment: Attachment = {
      id: skeletonId,
      noteId: note.id,
      type: 'instagram',
      storagePath: '',
      originalUrl: url,
      createdAt: new Date(),
      metadata: { loading: true, shortcode },
    }
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === note.id ? { ...n, attachments: [skeletonAttachment] } : n
      ),
    }))

    void (async () => {
      try {
        const loggedIn = await window.api.instagram.ensureLogin()
        console.info('[instagram] ensureLogin result', { loggedIn })
        if (!loggedIn) return

        const postData = await window.api.instagram.fetchPost(url)
        console.info('[instagram] fetchPost result', {
          hasData: Boolean(postData),
          mediaCount: postData?.media?.length ?? 0,
        })
        if (!postData) return

        const mediaItems = postData.media ?? []
        if (mediaItems.length === 0) {
          console.warn('[instagram] no media items available')
          return
        }

        let thumbnailAttachment: Attachment | null = null

        for (const [index, media] of mediaItems.entries()) {
          if (media.imageBase64 && (!media.videoBase64 || !thumbnailAttachment)) {
            const mimeMatch = media.imageBase64.match(/^data:([^;]+);base64,/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
            const extension = extensionFromMime(mimeType)
            const imageFile = fileFromDataUrl(
              media.imageBase64,
              `instagram-${shortcode}-${index + 1}.${extension}`
            )
            if (imageFile) {
              console.info('[instagram] uploading image', {
                noteId: note.id,
                index,
                name: imageFile.name,
                size: imageFile.size,
                type: imageFile.type,
              })
              const attachment = await get().addAttachment(note.id, imageFile)
              if (attachment && !thumbnailAttachment) {
                thumbnailAttachment = attachment
              }
            }
          }

          if (media.videoBase64) {
            const mimeMatch = media.videoBase64.match(/^data:([^;]+);base64,/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4'
            const extension = extensionFromMime(mimeType)
            const videoFile = fileFromDataUrl(
              media.videoBase64,
              `instagram-${shortcode}-${index + 1}.${extension}`
            )
            if (videoFile) {
              console.info('[instagram] uploading video', {
                noteId: note.id,
                index,
                name: videoFile.name,
                size: videoFile.size,
                type: videoFile.type,
              })
              await get().addAttachment(note.id, videoFile)
            }
          }
        }

        if (!thumbnailAttachment) {
          console.warn('[instagram] no thumbnail attachment available')
          return
        }

        const authorName = postData.username?.trim() || undefined
        const authorUrl =
          authorName && /^[A-Za-z0-9._]{1,30}$/.test(authorName)
            ? `https://www.instagram.com/${encodeURIComponent(authorName)}/`
            : undefined
        const originalUrl = normalizeExternalUrl(url)
        const caption = postData.caption?.trim() || undefined
        const metadata = {
          shortcode: postData.shortcode,
          postUrl: originalUrl,
          username: postData.username,
          displayName: postData.displayName,
          profilePicUrl: postData.profilePicUrl,
          timestamp: postData.timestamp,
          typename: postData.typename,
          caption,
          mediaCount: postData.media?.length ?? 0,
          media: (postData.media ?? []).map((item: InstagramMediaItem) => ({
            displayUrl: item.displayUrl,
            videoUrl: item.videoUrl,
            typename: item.typename,
          })),
        }

        const { data, error } = await supabase
          .from('attachments')
          .insert({
            note_id: note.id,
            type: 'instagram',
            storage_path: thumbnailAttachment.storagePath,
            filename: thumbnailAttachment.filename ?? null,
            mime_type: thumbnailAttachment.mimeType ?? null,
            size: thumbnailAttachment.size ?? null,
            metadata,
            original_url: originalUrl,
            author_name: authorName,
            author_url: authorUrl,
            caption,
          })
          .select()
          .single()

        if (error) {
          console.error('[instagram] attachment record failed', error)
          return
        }

        const attachment = attachmentRowToAttachment(data as AttachmentRow)
        console.info('[instagram] attachment created', { noteId: note.id, attachmentId: attachment.id })

        // skeleton 제거하고 실제 attachment 추가
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === note.id
              ? {
                  ...n,
                  attachments: [
                    ...n.attachments.filter((a) => a.id !== skeletonId),
                    attachment,
                  ],
                }
              : n
          ),
        }))

        // 인스타그램 태그 자동 추가
        await get().addTagToNote(note.id, '인스타그램')
      } catch (error) {
        console.error('Failed to fetch Instagram post:', error)
        // 에러 시 skeleton 제거
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === note.id
              ? { ...n, attachments: n.attachments.filter((a) => a.id !== skeletonId) }
              : n
          ),
        }))
      }
    })()

    return get().notes.find((item) => item.id === note.id) ?? note
  },
})
