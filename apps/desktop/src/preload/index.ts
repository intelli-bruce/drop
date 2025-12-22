import { contextBridge, ipcRenderer } from 'electron'

// Supabase를 renderer에서 직접 사용하므로 IPC 불필요
// 필요시 여기에 Electron 전용 API 추가 (파일 시스템 접근 등)

const api = {
  platform: process.platform,

  /**
   * 외부 URL을 시스템 기본 브라우저에서 엽니다.
   * 주의: window.open() 사용 금지 - Electron 창이 열림
   * 모든 웹 링크는 반드시 이 함수를 사용할 것
   */
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  instagram: {
    ensureLogin: (): Promise<boolean> => ipcRenderer.invoke('instagram:ensureLogin'),
    fetchPost: (url: string) => ipcRenderer.invoke('instagram:fetchPost', url),
  },
  youtube: {
    fetchOEmbed: (url: string) => ipcRenderer.invoke('youtube:fetchOEmbed', url),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
