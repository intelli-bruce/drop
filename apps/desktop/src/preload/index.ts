import { contextBridge, ipcRenderer } from 'electron'
import type {
  Note,
  Attachment,
  CreateNoteInput,
  UpdateNoteInput,
  CreateAttachmentInput,
} from '@throw/shared'

const api = {
  notes: {
    findAll: (): Promise<Note[]> => ipcRenderer.invoke('notes:findAll'),
    findById: (id: string): Promise<Note | null> => ipcRenderer.invoke('notes:findById', id),
    create: (input: CreateNoteInput): Promise<Note> => ipcRenderer.invoke('notes:create', input),
    update: (id: string, input: UpdateNoteInput): Promise<Note | null> =>
      ipcRenderer.invoke('notes:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('notes:delete', id),
    addAttachment: (noteId: string, input: CreateAttachmentInput): Promise<Attachment | null> =>
      ipcRenderer.invoke('notes:addAttachment', noteId, input),
    removeAttachment: (attachmentId: string): Promise<boolean> =>
      ipcRenderer.invoke('notes:removeAttachment', attachmentId),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
