// SQLiteの行データとアプリの LogEntry 型を相互変換するヘルパー。
import type { LogEntry, PillarId } from '@/types'

export interface LogRow {
  id: number
  date: string
  pillar: string
  category: string
  title: string
  note: string
  xp: number
  created_at: number
}

export function rowToLogEntry(row: LogRow, photos: string[]): LogEntry {
  return {
    id: row.id,
    date: row.date,
    pillar: row.pillar as PillarId,
    category: row.category,
    title: row.title,
    note: row.note,
    xp: row.xp,
    createdAt: row.created_at,
    ...(photos.length > 0 ? { photos } : {}),
  }
}
