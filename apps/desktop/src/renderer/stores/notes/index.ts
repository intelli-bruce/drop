import { create } from 'zustand'
import { createNotesSlice } from './notes-slice'
import { createTagsSlice } from './tags-slice'
import { createAttachmentsSlice } from './attachments-slice'
import { createInstagramSlice } from './instagram-slice'
import type { NotesState } from './types'

export type { NotesState } from './types'

export const useNotesStore = create<NotesState>()((...a) => ({
  ...createNotesSlice(...a),
  ...createTagsSlice(...a),
  ...createAttachmentsSlice(...a),
  ...createInstagramSlice(...a),
}))
