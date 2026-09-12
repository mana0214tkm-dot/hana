import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { lastNDays } from '@/lib/utils'
import type { PillarId } from '@/types'

// このAPIは生の logs テーブルではなく、事前集計済みの dwh_* テーブルだけを読む。
// これがデータウェアハウス層を用意する意味で、記録数が増えても分析取得が軽いままになる。
export const dynamic = 'force-dynamic'

const PILLARS: PillarId[] = ['career', 'love', 'oshi', 'money']
const TREND_DAYS = 30

interface DailyRow { date: string; pillar: PillarId; log_count: number; xp_sum: number }
interface CategoryRow { pillar: PillarId; category: string; log_count: number; xp_sum: number }

export async function GET() {
  const db = await getDb()

  const dailyResult = await db.execute('SELECT date, pillar, log_count, xp_sum FROM dwh_daily_pillar_stats')
  const dailyRows = dailyResult.rows as unknown as DailyRow[]

  const categoryResult = await db.execute(
    'SELECT pillar, category, log_count, xp_sum FROM dwh_category_stats ORDER BY xp_sum DESC'
  )
  const categoryRows = categoryResult.rows as unknown as CategoryRow[]

  const totals: Record<PillarId, { count: number; xp: number }> = {
    career: { count: 0, xp: 0 },
    love: { count: 0, xp: 0 },
    oshi: { count: 0, xp: 0 },
    money: { count: 0, xp: 0 },
  }
  for (const row of dailyRows) {
    totals[row.pillar].count += row.log_count
    totals[row.pillar].xp += row.xp_sum
  }

  const days = lastNDays(TREND_DAYS)
  const dailyMap = new Map<string, DailyRow>()
  for (const row of dailyRows) dailyMap.set(`${row.date}__${row.pillar}`, row)

  const trend: Record<PillarId, { date: string; xp: number; count: number }[]> = {
    career: [], love: [], oshi: [], money: [],
  }
  for (const pillar of PILLARS) {
    trend[pillar] = days.map(date => {
      const row = dailyMap.get(`${date}__${pillar}`)
      return { date, xp: row?.xp_sum ?? 0, count: row?.log_count ?? 0 }
    })
  }

  const topCategories: Record<PillarId, CategoryRow[]> = {
    career: [], love: [], oshi: [], money: [],
  }
  for (const row of categoryRows) {
    topCategories[row.pillar].push(row)
  }

  const grandTotal = PILLARS.reduce(
    (acc, p) => ({ count: acc.count + totals[p].count, xp: acc.xp + totals[p].xp }),
    { count: 0, xp: 0 }
  )

  return NextResponse.json({ totals, trend, topCategories, grandTotal })
}
