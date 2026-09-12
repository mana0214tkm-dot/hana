'use client'
import { useMemo } from 'react'
import type { Pillar } from '@/types'
import { useStore } from '@/store/useStore'
import { lastNDays } from '@/lib/utils'
import { logsByPillar, streakByPillar, countByCategory } from '@/lib/stats'

export default function StatsPanel({ pillar }: { pillar: Pillar }) {
  const allLogs = useStore(s => s.logs)
  const logs = useMemo(() => logsByPillar(allLogs, pillar.id), [allLogs, pillar.id])
  const streak = useMemo(() => streakByPillar(allLogs, pillar.id), [allLogs, pillar.id])
  const catCounts = useMemo(() => countByCategory(allLogs, pillar.id), [allLogs, pillar.id])
  const totalXp = logs.reduce((sum, l) => sum + l.xp, 0)

  const days = lastNDays(35)
  const dateSet = new Set(logs.map(l => l.date))

  return (
    <div className={`stats-grid ${pillar.theme}`}>
      <div className="card stat-card">
        <div className="stat-value">🔥 {streak}</div>
        <div className="stat-label">連続記録日数</div>
      </div>
      <div className="card stat-card">
        <div className="stat-value">{logs.length}</div>
        <div className="stat-label">記録した数</div>
      </div>
      <div className="card stat-card">
        <div className="stat-value">{totalXp}pt</div>
        <div className="stat-label">積み上げたポイント</div>
      </div>

      <div className="card heatmap-card">
        <div className="card-title">直近5週間の記録</div>
        <div className="heatmap">
          {days.map(d => (
            <div key={d} className={`heatmap-cell ${dateSet.has(d) ? 'on' : ''}`} title={d} />
          ))}
        </div>
      </div>

      <div className="card category-card">
        <div className="card-title">カテゴリ別の記録</div>
        <div className="category-stats">
          {pillar.categories.map(c => (
            <div key={c.id} className="category-stat-row">
              <span>{c.icon} {c.label}</span>
              <span className="category-stat-count">{catCounts[c.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
