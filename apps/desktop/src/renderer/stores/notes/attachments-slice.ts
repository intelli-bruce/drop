import type { StateCreator } from 'zustand'
import { supabase, uploadAttachment } from '../../lib/supabase'
import { attachmentRowToAttachment } from '@throw/shared'
import type { AttachmentType, AttachmentRow } from '@throw/shared'
import type { NotesState, AttachmentsSlice } from './types'

export const createAttachmentsSlice: StateCreator<NotesState, [], [], AttachmentsSlice> = (set) => ({
  addAttachment: async (noteId, file) => {
    console.info('[attachments] upload start', {
      noteId,
      name: file.name,
      type: file.type,
      size: file.size,
    })
    // Storage에 파일 업로드
    const { path, error: uploadError } = await uploadAttachment(file, noteId)
    if (uploadError) {
      console.error('Failed to upload attachment:', uploadError)
      return null
    }
    console.info('[attachments] upload success', { noteId, path })

    // 첨부파일 타입 결정
    let type: AttachmentType = 'file'
    if (file.type.startsWith('image/')) type = 'image'
    else if (file.type.startsWith('audio/')) type = 'audio'
    else if (file.type.startsWith('video/')) type = 'video'

    // DB에 레코드 삽입
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        note_id: noteId,
        type,
        storage_path: path,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create attachment record:', error)
      return null
    }

    const attachment = attachmentRowToAttachment(data as AttachmentRow)
    console.info('[attachments] record created', { noteId, attachmentId: attachment.id })

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId ? { ...n, attachments: [...n.attachments, attachment] } : n
      ),
    }))

    return attachment
  },

  removeAttachment: async (noteId, attachmentId) => {
    // 먼저 storage_path 조회
    const { data: attachment } = await supabase
      .from('attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single()

    if (attachment?.storage_path) {
      // Storage에서 파일 삭제
      await supabase.storage.from('attachments').remove([attachment.storage_path])
    }

    // DB에서 레코드 삭제
    const { error } = await supabase.from('attachments').delete().eq('id', attachmentId)

    if (error) {
      console.error('Failed to delete attachment:', error)
      return
    }

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId
          ? { ...n, attachments: n.attachments.filter((a) => a.id !== attachmentId) }
          : n
      ),
    }))
  },
})
