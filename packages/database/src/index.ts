import Database from 'better-sqlite3'
import { initializeSchema } from './schema'

export { NotesRepository } from './notes'

export function createDatabase(path: string): Database.Database {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  initializeSchema(db)
  return db
}
