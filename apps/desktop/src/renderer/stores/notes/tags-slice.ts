import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { tagRowToTag } from '@throw/shared'
import type { TagRow } from '@throw/shared'
import type { NotesState, TagsSlice } from './types'

export const createTagsSlice: StateCreator<NotesState, [], [], TagsSlice> = (set) => ({
  allTags: [],
  filterTag: null,

  loadTags: async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      const allTags = (data ?? []).map((row) => tagRowToTag(row as TagRow))
      set({ allTags })
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  },

  addTagToNote: async (noteId, tagName) => {
    const trimmedName = tagName.trim().toLowerCase()
    if (!trimmedName) return

    try {
      // 1. 태그가 이미 존재하는지 확인, 없으면 생성
      let { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('name', trimmedName)
        .single()

      if (!existingTag) {
        const { data: newTag, error: createError } = await supabase
          .from('tags')
          .insert({ name: trimmedName })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create tag:', createError)
          return
        }
        existingTag = newTag
      }

      const tag = tagRowToTag(existingTag as TagRow)

      // 2. note_tags 관계 추가 (이미 있으면 무시)
      const { error: linkError } = await supabase
        .from('note_tags')
        .upsert({ note_id: noteId, tag_id: tag.id }, { onConflict: 'note_id,tag_id' })

      if (linkError) {
        console.error('Failed to link tag to note:', linkError)
        return
      }

      // 3. 로컬 상태 업데이트
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId && !n.tags.some((t) => t.id === tag.id)
            ? { ...n, tags: [...n.tags, tag] }
            : n
        ),
        allTags: state.allTags.some((t) => t.id === tag.id)
          ? state.allTags
          : [...state.allTags, tag].sort((a, b) => a.name.localeCompare(b.name)),
      }))
    } catch (error) {
      console.error('Failed to add tag to note:', error)
    }
  },

  removeTagFromNote: async (noteId, tagId) => {
    try {
      const { error } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)
        .eq('tag_id', tagId)

      if (error) {
        console.error('Failed to remove tag from note:', error)
        return
      }

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, tags: n.tags.filter((t) => t.id !== tagId) } : n
        ),
      }))
    } catch (error) {
      console.error('Failed to remove tag from note:', error)
    }
  },

  setFilterTag: (tagName) => {
    set({ filterTag: tagName })
  },
})
