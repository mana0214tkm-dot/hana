'use client'
import { useMemo } from 'react'
import type { PillarId } from '@/types'
import { PILLARS } from '@/lib/pillars'
import { getStage, progressToNext } from '@/lib/growth'
import { useStore } from '@/store/useStore'
import { xpByPillar } from '@/lib/stats'
import FlowerStage from './FlowerStage'

export default function OverviewGrid({
  selected,
  onSelect,
}: {
  selected: PillarId
  onSelect: (id: PillarId) => void
}) {
  const logs = useStore(s => s.logs)
  const xpMap = useMemo(() => xpByPillar(logs), [logs])

  return (
    <div className="overview-grid">
      {PILLARS.map(p => {
        const xp = xpMap[p.id]
        const stage = getStage(p.stages, xp)
        const progress = progressToNext(p.stages, xp)
        const active = p.id === selected
        return (
          <button
            key={p.id}
            className={`overview-card ${p.theme} ${active ? 'active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <div className="overview-icon"><FlowerStage level={stage.level} size={56} /></div>
            <div className="overview-label">{p.label}</div>
            <div className="overview-stage">{stage.name}</div>
            <div className="overview-progress-bar">
              <div className="overview-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="overview-xp">{xp}pt</div>
          </button>
        )
      })}
    </div>
  )
}
