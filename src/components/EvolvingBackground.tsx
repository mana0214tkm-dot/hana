'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { PILLARS } from '@/lib/pillars'
import { xpByPillar } from '@/lib/stats'

const MAX_XP_PER_PILLAR = 1560
const BLOOM_ITEMS = ['🌸', '🌷', '💮', '🌼', '🌺', '✨', '💫', '🌟']

// 4本柱の合計進捗度(0〜1)に応じて、ページ全体の背景を
// 「何もない土」から「花いっぱいの庭」へと進化させる装飾レイヤー。
// 記録が積み上がるほど、背景の彩りと花の数が増えていく。
export default function EvolvingBackground() {
  const logs = useStore(s => s.logs)

  const progress = useMemo(() => {
    const xpMap = xpByPillar(logs)
    const total = PILLARS.reduce((sum, p) => sum + xpMap[p.id], 0)
    const max = MAX_XP_PER_PILLAR * PILLARS.length
    return Math.min(1, total / max)
  }, [logs])

  // 進捗に応じて咲く花の数を段階的に増やす(最大24輪)
  const bloomCount = Math.round(progress * 24)
  const blooms = useMemo(
    () =>
      Array.from({ length: bloomCount }, (_, i) => ({
        key: i,
        icon: BLOOM_ITEMS[i % BLOOM_ITEMS.length],
        // 黄金角(137.5°)を使って均等かつランダムっぽく画面に散らす
        left: (i * 137.5) % 100,
        top: (i * 71.3) % 100,
        size: 14 + (i % 4) * 6,
        delay: (i % 6) * 1.3,
      })),
    [bloomCount]
  )

  return (
    <div className="evolving-bg" aria-hidden="true" style={{ '--evolve': progress } as React.CSSProperties}>
      <div className="evolving-bg-glow" />
      {blooms.map(b => (
        <span
          key={b.key}
          className="evolving-bloom"
          style={{ left: `${b.left}%`, top: `${b.top}%`, fontSize: `${b.size}px`, animationDelay: `${b.delay}s` }}
        >
          {b.icon}
        </span>
      ))}
    </div>
  )
}
