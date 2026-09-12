import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(_request: Request, ctx: RouteContext<'/api/logs/[id]'>) {
  const { id } = await ctx.params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: '不正な id です' }, { status: 400 })
  }
  const db = await getDb()
  // ON DELETE CASCADE はSQLiteの `PRAGMA foreign_keys = ON` に依存するため、
  // 接続方式(ローカルファイル/Turso)によらず確実に消えるよう明示的にも削除しておく。
  const tx = await db.transaction('write')
  try {
    await tx.execute({ sql: 'DELETE FROM log_photos WHERE log_id = ?', args: [numericId] })
    await tx.execute({ sql: 'DELETE FROM logs WHERE id = ?', args: [numericId] })
    await tx.commit()
  } catch (e) {
    await tx.rollback()
    throw e
  }
  return NextResponse.json({ ok: true })
}
