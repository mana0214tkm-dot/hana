'use client'
import { useEffect, useMemo, useState } from 'react'
import type { PillarId } from '@/types'
import { PILLARS, getPillar } from '@/lib/pillars'
import { useStore } from '@/store/useStore'
import { xpByPillar as calcXpByPillar } from '@/lib/stats'
import OverviewGrid from '@/components/OverviewGrid'
import GrowthStage from '@/components/GrowthStage'
import RoadmapStrip from '@/components/RoadmapStrip'
import LogForm from '@/components/LogForm'
import Timeline from '@/components/Timeline'
import StatsPanel from '@/components/StatsPanel'
import WarehousePanel from '@/components/WarehousePanel'
import FloatingHearts from '@/components/FloatingHearts'
import EvolvingBackground from '@/components/EvolvingBackground'

export default function Home() {
  const [selected, setSelected] = useState<PillarId>(PILLARS[0].id)
  const logs = useStore(s => s.logs)
  const loading = useStore(s => s.loading)
  const error = useStore(s => s.error)
  const init = useStore(s => s.init)
  const xpMap = useMemo(() => calcXpByPillar(logs), [logs])
  const pillar = getPillar(selected)

  useEffect(() => {
    init()
  }, [init])

  return (
    <div className="app-shell">
      <EvolvingBackground />
      <FloatingHearts />
      <header className="app-header">
        <div className="app-title">💖 人生ときめき育成記</div>
        <p className="app-subtitle">
          仕事、恋愛・結婚、推し活、お金。<br className="br-mobile" />
          人生を支える4本の柱を、あなたの記録でそれぞれ育てていくアプリです。
        </p>
      </header>

      {error && <div className="app-banner app-banner-error">⚠️ {error}</div>}

      <main className="main-content">
        <OverviewGrid selected={selected} onSelect={setSelected} />

        {loading ? (
          <div className="loading-panel">読み込み中...</div>
        ) : (
          <>
            <GrowthStage pillar={pillar} xp={xpMap[pillar.id]} />
            <StatsPanel pillar={pillar} />
            <div className="two-col">
              <LogForm key={pillar.id} pillar={pillar} />
              <Timeline pillar={pillar} />
            </div>
            <RoadmapStrip pillar={pillar} xp={xpMap[pillar.id]} />
            <WarehousePanel />
          </>
        )}
      </main>

      <footer className="app-footer">
        記録はすべてサーバーのデータベース(SQLite)に保存され、分析用データウェアハウスにも連携されます。
      </footer>
    </div>
  )
}
