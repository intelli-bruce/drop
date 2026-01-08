import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { config } from 'dotenv'

export default defineConfig(({ mode }) => {
  // Load .env file based on mode
  const envFile = mode === 'localdev' ? '.env.localdev' : '.env.remote'
  const envConfig = config({ path: resolve(__dirname, envFile) })

  return {
    main: {
      plugins: [externalizeDepsPlugin({ exclude: ['@drop/database', '@drop/shared'] })],
      define: {
        'process.env.ALADIN_TTB_KEY': JSON.stringify(envConfig.parsed?.ALADIN_TTB_KEY || ''),
        'process.env.NAVER_CLIENT_ID': JSON.stringify(envConfig.parsed?.NAVER_CLIENT_ID || ''),
        'process.env.NAVER_CLIENT_SECRET': JSON.stringify(envConfig.parsed?.NAVER_CLIENT_SECRET || ''),
        'process.env.KAKAO_REST_API_KEY': JSON.stringify(envConfig.parsed?.KAKAO_REST_API_KEY || ''),
        'process.env.GOOGLE_BOOKS_API_KEY': JSON.stringify(envConfig.parsed?.GOOGLE_BOOKS_API_KEY || ''),
      },
      build: {
        rollupOptions: {
          external: ['better-sqlite3'],
        },
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin({ exclude: ['@drop/shared'] })],
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer'),
        },
      },
      plugins: [react()],
    },
  }
})
