'use client'
import { useEffect, useState } from 'react'
import { PILLARS, getPillar, getCategory } from '@/lib/pillars'
import { useStore } from '@/store/useStore'
import type { PillarId } from '@/types'

interface DailyPoint { date: string; xp: number; count: number }
interface CategoryStat { pillar: PillarId; category: string; log_count: number; xp_sum: number }
interface WarehouseData {
  totals: Record<PillarId, { count: number; xp: number }>
  trend: Record<PillarId, DailyPoint[]>
  topCategories: Record<PillarId, CategoryStat[]>
  grandTotal: { count: number; xp: number }
}

// データウェアハウス(dwh_*テーブル)から取得した集計を可視化する分析パネル。
// 生ログを都度集計するのではなく、あらかじめ集計済みのAPIレスポンスをそのまま描画するだけ。
// logs が増減するたび(記録の追加・削除のたび)に再取得し、常に最新の集計を表示する。
export default function WarehousePanel() {
  const logs = useStore(s => s.logs)
  const [data, setData] = useState<WarehouseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/warehouse')
      .then(res => res.json())
      .then(json => { if (!cancelled) setData(json) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // logs が増減するたび(記録の追加・削除のたび)に再取得する。
    // ただし2回目以降は data が既にあるので、下の描画では loading フラグを見ずに
    // data の有無だけで表示を切り替え、ちらつきを防いでいる。
  }, [logs])

  if (loading && !data) {
    return (
      <div className="card warehouse-card">
        <div className="card-title">💫 ときめきアナリティクス</div>
        <div className="loading-panel">分析データを読み込み中...</div>
      </div>
    )
  }
  if (!data) return null

  const maxXp = Math.max(1, ...PILLARS.flatMap(p => data.trend[p.id].map(d => d.xp)))

  return (
    <div className="card warehouse-card">
      <div className="card-title">💫 ときめきアナリティクス <span className="warehouse-badge">データウェアハウス連携</span></div>
      <p className="warehouse-lead">
        4本柱すべての記録を横断集計。積み上げてきた「ときめき」の総量が一目でわかります。
      </p>

      <div className="warehouse-grand">
        <div className="warehouse-grand-value">✨ {data.grandTotal.xp.toLocaleString()}pt</div>
        <div className="warehouse-grand-label">人生ぜんぶの、積み上げポイント合計({data.grandTotal.count}件の記録)</div>
      </div>

      <div className="warehouse-pillars">
        {PILLARS.map(pillar => {
          const t = data.totals[pillar.id]
          const trend = data.trend[pillar.id]
          const top = data.topCategories[pillar.id]?.[0]
          return (
            <div key={pillar.id} className={`warehouse-pillar-card ${pillar.theme}`}>
              <div className="warehouse-pillar-head">
                <span>{pillar.icon} {pillar.shortLabel}</span>
                <span className="warehouse-pillar-xp">{t.xp.toLocaleString()}pt</span>
              </div>
              <div className="warehouse-trend">
                {trend.map(d => (
                  <div
                    key={d.date}
                    className="warehouse-bar"
                    style={{ height: `${Math.max(4, (d.xp / maxXp) * 100)}%` }}
                    title={`${d.date}: ${d.xp}pt`}
                  />
                ))}
              </div>
              <div className="warehouse-pillar-foot">
                {top ? (
                  <span>いちばん多いのは「{getCategory(getPillar(pillar.id), top.category).label}」({top.log_count}件)</span>
                ) : (
                  <span>まだ記録がありません</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
