import { contextBridge, ipcRenderer } from 'electron'

// Supabase를 renderer에서 직접 사용하므로 IPC 불필요
// 필요시 여기에 Electron 전용 API 추가 (파일 시스템 접근 등)

const api = {
  // 추후 필요한 Electron 전용 기능 추가
  platform: process.platform,
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  instagram: {
    ensureLogin: (): Promise<boolean> => ipcRenderer.invoke('instagram:ensureLogin'),
    fetchPost: (url: string) => ipcRenderer.invoke('instagram:fetchPost', url),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
