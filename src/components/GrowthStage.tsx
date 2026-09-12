'use client'
import type { Pillar } from '@/types'
import { getStage, getNextStage, progressToNext } from '@/lib/growth'
import FlowerStage from './FlowerStage'

export default function GrowthStage({ pillar, xp }: { pillar: Pillar; xp: number }) {
  const stage = getStage(pillar.stages, xp)
  const next = getNextStage(pillar.stages, xp)
  const progress = progressToNext(pillar.stages, xp)

  return (
    <div className={`growth-hero card ${pillar.theme}`}>
      <div className="sparkle-field" aria-hidden="true">
        <span className="sparkle s1">✨</span>
        <span className="sparkle s2">💫</span>
        <span className="sparkle s3">✨</span>
        <span className="sparkle s4">⭐</span>
      </div>
      <div className="growth-pillar-label">{pillar.icon} {pillar.label}</div>
      <div className="growth-icon-wrap">
        <div className="growth-icon-glow" />
        <div className="growth-icon">
          <FlowerStage level={stage.level} size={108} />
        </div>
      </div>
      <div className="growth-name">{stage.name}</div>
      <div className="growth-phase">{stage.phase}</div>
      <p className="growth-message">{stage.message}</p>

      <div className="growth-progress">
        <div className="growth-progress-bar">
          <div className="growth-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="growth-progress-label">
          {next
            ? <>次のステージ「{next.name}」まで あと {Math.max(0, next.minXp - xp)} pt</>
            : <>すべてのステージに到達しました。ここまで本当にお疲れさまでした {stage.icon}</>}
        </div>
      </div>
    </div>
  )
}
