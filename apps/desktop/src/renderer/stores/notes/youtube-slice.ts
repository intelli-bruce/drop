/// <reference path="../../../preload/index.d.ts" />
import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { normalizeExternalUrl } from '../../lib/file-utils'
import { attachmentRowToAttachment } from '@throw/shared'
import type { AttachmentRow, Attachment } from '@throw/shared'
import type { NotesState, YouTubeSlice } from './types'

export const createYouTubeSlice: StateCreator<NotesState, [], [], YouTubeSlice> = (
  set,
  get
) => ({
  createNoteWithYouTube: async (url) => {
    const videoIdMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    if (!videoId) return null

    console.info('[youtube] createNoteWithYouTube start', { url, videoId })
    const note = await get().createNote()
    console.info('[youtube] note created', { noteId: note.id })

    // 로딩 중 표시를 위한 임시 skeleton attachment 추가
    const skeletonId = `skeleton-yt-${videoId}`
    const skeletonAttachment: Attachment = {
      id: skeletonId,
      noteId: note.id,
      type: 'youtube',
      storagePath: '',
      originalUrl: url,
      createdAt: new Date(),
      metadata: { loading: true, videoId },
    }
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === note.id ? { ...n, attachments: [skeletonAttachment] } : n
      ),
    }))

    void (async () => {
      try {
        const oembedData = await window.api.youtube.fetchOEmbed(url)
        console.info('[youtube] fetchOEmbed result', {
          hasData: Boolean(oembedData),
          title: oembedData?.title,
        })
        if (!oembedData) {
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === note.id
                ? { ...n, attachments: n.attachments.filter((a) => a.id !== skeletonId) }
                : n
            ),
          }))
          return
        }

        const originalUrl = normalizeExternalUrl(url)
        const authorName = oembedData.authorName?.trim() || undefined
        const authorUrl = oembedData.authorUrl?.trim() || undefined
        const caption = oembedData.title?.trim() || undefined
        const metadata = {
          videoId: oembedData.videoId,
          videoUrl: oembedData.videoUrl,
          title: oembedData.title,
          authorName: oembedData.authorName,
          authorUrl: oembedData.authorUrl,
          thumbnailUrl: oembedData.thumbnailUrl,
        }

        const { data, error } = await supabase
          .from('attachments')
          .insert({
            note_id: note.id,
            type: 'youtube',
            storage_path: '',
            metadata,
            original_url: originalUrl,
            author_name: authorName,
            author_url: authorUrl,
            caption,
          })
          .select()
          .single()

        if (error) {
          console.error('[youtube] attachment record failed', error)
          return
        }

        const attachment = attachmentRowToAttachment(data as AttachmentRow)
        console.info('[youtube] attachment created', { noteId: note.id, attachmentId: attachment.id })

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

        await get().addTagToNote(note.id, 'YouTube')
      } catch (error) {
        console.error('Failed to fetch YouTube oEmbed:', error)
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
