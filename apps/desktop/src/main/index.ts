import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { createDatabase, NotesRepository } from '@throw/database'
import type { CreateNoteInput, UpdateNoteInput, CreateAttachmentInput } from '@throw/shared'

const dbPath = join(app.getPath('userData'), 'throw.db')
let db: ReturnType<typeof createDatabase>
let notesRepo: NotesRepository

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function setupIpcHandlers(): void {
  ipcMain.handle('notes:findAll', () => {
    return notesRepo.findAll()
  })

  ipcMain.handle('notes:findById', (_event, id: string) => {
    return notesRepo.findById(id)
  })

  ipcMain.handle('notes:create', (_event, input: CreateNoteInput) => {
    return notesRepo.create(input)
  })

  ipcMain.handle('notes:update', (_event, id: string, input: UpdateNoteInput) => {
    return notesRepo.update(id, input)
  })

  ipcMain.handle('notes:delete', (_event, id: string) => {
    return notesRepo.softDelete(id)
  })

  ipcMain.handle('notes:addAttachment', (_event, noteId: string, input: CreateAttachmentInput) => {
    return notesRepo.addAttachment(noteId, input)
  })

  ipcMain.handle('notes:removeAttachment', (_event, attachmentId: string) => {
    return notesRepo.removeAttachment(attachmentId)
  })
}

app.whenReady().then(() => {
  db = createDatabase(dbPath)
  notesRepo = new NotesRepository(db)

  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  if (db) {
    db.close()
  }
})
