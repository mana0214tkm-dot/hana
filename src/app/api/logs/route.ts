import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { rowToLogEntry, type LogRow } from '@/lib/logRow'
import { PILLARS, getPillar, getCategory } from '@/lib/pillars'
import { todayStr } from '@/lib/utils'
import type { PillarId } from '@/types'

// 記録は毎回サーバー(Turso/libSQL)から取得するため静的化しない。
export const dynamic = 'force-dynamic'

// UI側は最大4枚・900px圧縮(image.ts)だが、APIを直接叩かれた場合の
// ストレージ枯渇/DoSを防ぐため、サーバー側でも上限を強制する。
const MAX_PHOTOS = 4
const MAX_PHOTO_DATA_URL_LENGTH = 2_000_000 // 約1.4MB相当(圧縮後の想定サイズに余裕を持たせた上限)
const MAX_TITLE_LENGTH = 200
const MAX_NOTE_LENGTH = 4000

interface PhotoRow {
  log_id: number
  data: string
}

async function attachPhotos(rows: LogRow[]) {
  if (rows.length === 0) return []
  const db = await getDb()
  const ids = rows.map(r => r.id)
  const placeholders = ids.map(() => '?').join(',')
  const photoResult = await db.execute({
    sql: `SELECT log_id, data FROM log_photos WHERE log_id IN (${placeholders}) ORDER BY position ASC, id ASC`,
    args: ids,
  })
  const photoRows = photoResult.rows as unknown as PhotoRow[]
  const photosByLog = new Map<number, string[]>()
  for (const p of photoRows) {
    const list = photosByLog.get(p.log_id) ?? []
    list.push(p.data)
    photosByLog.set(p.log_id, list)
  }
  return rows.map(r => rowToLogEntry(r, photosByLog.get(r.id) ?? []))
}

export async function GET() {
  const db = await getDb()
  const result = await db.execute('SELECT * FROM logs ORDER BY created_at DESC')
  const rows = result.rows as unknown as LogRow[]
  return NextResponse.json(await attachPhotos(rows))
}

interface CreateBody {
  pillar: PillarId
  category: string
  title?: string
  note?: string
  photos?: string[]
  // 以下はlocalStorageからの移行時にのみ、元の日時を保持するために使う
  date?: string
  createdAt?: number
}

export async function POST(request: Request) {
  let body: CreateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const { pillar, category, title, note, photos } = body
  if (!pillar || !category) {
    return NextResponse.json({ error: 'pillar と category は必須です' }, { status: 400 })
  }
  if (!PILLARS.some(p => p.id === pillar)) {
    return NextResponse.json({ error: '不正な pillar です' }, { status: 400 })
  }

  const pillarInfo = getPillar(pillar)
  if (!pillarInfo.categories.some(c => c.id === category)) {
    return NextResponse.json({ error: '不正な category です' }, { status: 400 })
  }
  const catInfo = getCategory(pillarInfo, category)

  if (title !== undefined && (typeof title !== 'string' || title.length > MAX_TITLE_LENGTH)) {
    return NextResponse.json({ error: `title は${MAX_TITLE_LENGTH}文字以内の文字列である必要があります` }, { status: 400 })
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > MAX_NOTE_LENGTH)) {
    return NextResponse.json({ error: `note は${MAX_NOTE_LENGTH}文字以内の文字列である必要があります` }, { status: 400 })
  }
  if (photos !== undefined) {
    if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `photos は最大${MAX_PHOTOS}枚までです` }, { status: 400 })
    }
    if (photos.some(p => typeof p !== 'string' || p.length > MAX_PHOTO_DATA_URL_LENGTH || !p.startsWith('data:image/'))) {
      return NextResponse.json({ error: '不正な photos データです' }, { status: 400 })
    }
  }

  const date = body.date || todayStr()
  const createdAt = body.createdAt ?? Date.now()
  const finalTitle = (title ?? '').trim() || catInfo.label
  const finalNote = (note ?? '').trim()
  const finalPhotos = (photos ?? []).filter(p => typeof p === 'string' && p.length > 0)

  const db = await getDb()
  const tx = await db.transaction('write')
  let logId: number
  try {
    const result = await tx.execute({
      sql: `INSERT INTO logs (date, pillar, category, title, note, xp, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [date, pillar, category, finalTitle, finalNote, catInfo.baseXp, createdAt],
    })
    logId = Number(result.lastInsertRowid)
    for (let i = 0; i < finalPhotos.length; i++) {
      await tx.execute({
        sql: `INSERT INTO log_photos (log_id, data, position, created_at) VALUES (?, ?, ?, ?)`,
        args: [logId, finalPhotos[i], i, createdAt],
      })
    }
    await tx.commit()
  } catch (e) {
    await tx.rollback()
    throw e
  }

  const rowResult = await db.execute({ sql: 'SELECT * FROM logs WHERE id = ?', args: [logId] })
  const row = (rowResult.rows as unknown as LogRow[])[0]
  const saved = (await attachPhotos([row]))[0]

  return NextResponse.json(saved, { status: 201 })
}
