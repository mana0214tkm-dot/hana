'use client'
import { useMemo, useState } from 'react'
import type { Pillar } from '@/types'
import { useStore } from '@/store/useStore'
import { getCategory } from '@/lib/pillars'
import { formatDate } from '@/lib/utils'
import { logsByPillar } from '@/lib/stats'

interface LightboxState {
  photos: string[]
  index: number
}

export default function Timeline({ pillar }: { pillar: Pillar }) {
  const allLogs = useStore(s => s.logs)
  const deleteLog = useStore(s => s.deleteLog)
  const logs = useMemo(() => logsByPillar(allLogs, pillar.id), [allLogs, pillar.id])
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  if (logs.length === 0) {
    return (
      <div className={`card ${pillar.theme}`}>
        <div className="card-title">{pillar.label}のこれまでの記録</div>
        <div className="empty">
          <div className="empty-icon">{pillar.icon}</div>
          まだ記録がありません。<br />
          最初の一歩を記録してみましょう。
        </div>
      </div>
    )
  }

  const showPrev = () => setLightbox(lb => lb && ({ ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length }))
  const showNext = () => setLightbox(lb => lb && ({ ...lb, index: (lb.index + 1) % lb.photos.length }))

  return (
    <div className={`card ${pillar.theme}`}>
      <div className="card-title">{pillar.label}のこれまでの記録 ({logs.length}件)</div>
      <div className="timeline">
        {logs.map(l => {
          const info = getCategory(pillar, l.category)
          const photos = l.photos ?? []
          return (
            <div key={l.id} className="timeline-item">
              <div className="timeline-icon">{info.icon}</div>
              <div className="timeline-body">
                <div className="timeline-top">
                  <span className="timeline-title">{l.title}</span>
                  <span className="tag tag-xp">+{l.xp}pt</span>
                </div>
                {l.note && <p className="timeline-note">{l.note}</p>}
                {photos.length > 0 && (
                  <div className="timeline-photo-grid">
                    {photos.map((src, i) => (
                      <button
                        type="button"
                        key={i}
                        className="timeline-photo-btn"
                        onClick={() => setLightbox({ photos, index: i })}
                      >
                        <img src={src} alt={`${l.title}の写真${i + 1}`} className="timeline-photo" />
                      </button>
                    ))}
                  </div>
                )}
                <span className="timeline-date">{formatDate(l.date)}</span>
              </div>
              <button
                className="btn-icon"
                onClick={() => {
                  if (window.confirm(`「${l.title}」の記録を削除しますか?`)) deleteLog(l.id)
                }}
                aria-label="この記録を削除"
                title="この記録を削除"
              >✕</button>
            </div>
          )
        })}
      </div>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img
            src={lightbox.photos[lightbox.index]}
            alt="拡大表示された写真"
            className="lightbox-image"
            onClick={e => e.stopPropagation()}
          />
          {lightbox.photos.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={e => { e.stopPropagation(); showPrev() }}
                aria-label="前の写真"
              >‹</button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={e => { e.stopPropagation(); showNext() }}
                aria-label="次の写真"
              >›</button>
              <div className="lightbox-count">{lightbox.index + 1} / {lightbox.photos.length}</div>
            </>
          )}
          <button
            className="lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="閉じる"
          >✕</button>
        </div>
      )}
    </div>
  )
}
