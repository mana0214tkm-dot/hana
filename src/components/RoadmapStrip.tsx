'use client'
import type { Pillar } from '@/types'
import { getStage } from '@/lib/growth'
import FlowerStage from './FlowerStage'

export default function RoadmapStrip({ pillar, xp }: { pillar: Pillar; xp: number }) {
  const current = getStage(pillar.stages, xp)
  return (
    <div className={`card ${pillar.theme}`}>
      <div className="card-title">{pillar.label}の道のり</div>
      <div className="roadmap">
        {pillar.stages.map(s => {
          const reached = xp >= s.minXp
          const isCurrent = s.level === current.level
          return (
            <div
              key={s.level}
              className={`roadmap-step ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
              title={`${s.name} - ${s.phase}`}
            >
              <div className="roadmap-icon"><FlowerStage level={s.level} size={40} /></div>
              <div className="roadmap-name">{s.name}</div>
              <div className="roadmap-phase">{s.phase}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
