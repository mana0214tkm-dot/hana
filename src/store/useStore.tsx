'use client'
import { create } from 'zustand'
import type { LogEntry, PillarId } from '@/types'

const OLD_LOCAL_STORAGE_KEY = 'sodate-career-v2'

interface AppState {
  logs: LogEntry[]
  loading: boolean
  error: string | null
  /** サーバー(SQLite)から記録を読み込み、localStorageに古いデータがあれば移行する */
  init: () => Promise<void>
  addLog: (pillar: PillarId, category: string, title: string, note: string, photos?: string[]) => Promise<void>
  deleteLog: (id: number) => Promise<void>
}

async function fetchLogs(): Promise<LogEntry[]> {
  const res = await fetch('/api/logs')
  if (!res.ok) throw new Error('記録の取得に失敗しました')
  return res.json()
}

// 以前 localStorage に保存されていた記録を、初回起動時だけサーバーDBへ移行する。
async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(OLD_LOCAL_STORAGE_KEY)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw)
    const oldLogs: (LogEntry & { photo?: string })[] = parsed?.state?.logs ?? []
    if (Array.isArray(oldLogs) && oldLogs.length > 0) {
      // 元の日時を保ったまま、古い記録を1件ずつサーバーへ登録する
      for (const log of [...oldLogs].reverse()) {
        const photos = log.photos ?? (log.photo ? [log.photo] : [])
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pillar: log.pillar,
            category: log.category,
            title: log.title,
            note: log.note,
            photos,
            date: log.date,
            createdAt: log.createdAt,
          }),
        })
      }
    }
  } finally {
    // 移行できてもできなくても、古いデータは片付けて二重移行を防ぐ
    window.localStorage.removeItem(OLD_LOCAL_STORAGE_KEY)
  }
}

export const useStore = create<AppState>()((set, get) => ({
  logs: [],
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null })
    try {
      await migrateFromLocalStorage()
      const logs = await fetchLogs()
      set({ logs, loading: false })
    } catch {
      set({ loading: false, error: 'データベースへの接続に失敗しました' })
    }
  },

  addLog: async (pillar, category, title, note, photos) => {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillar, category, title, note, photos }),
    })
    if (!res.ok) {
      set({ error: '記録の保存に失敗しました' })
      return
    }
    const saved: LogEntry = await res.json()
    set({ logs: [saved, ...get().logs], error: null })
  },

  deleteLog: async (id) => {
    const prevLogs = get().logs
    // 先に画面から消し、失敗したら元に戻す
    set({ logs: prevLogs.filter(l => l.id !== id) })
    const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      set({ logs: prevLogs, error: '記録の削除に失敗しました' })
    }
  },
}))
