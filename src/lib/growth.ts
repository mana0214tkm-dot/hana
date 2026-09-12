import type { Stage } from '@/types'

export function getStage(stages: Stage[], xp: number): Stage {
  let current = stages[0]
  for (const s of stages) {
    if (xp >= s.minXp) current = s
  }
  return current
}

export function getNextStage(stages: Stage[], xp: number): Stage | null {
  const current = getStage(stages, xp)
  const idx = stages.findIndex(s => s.level === current.level)
  return stages[idx + 1] ?? null
}

export function progressToNext(stages: Stage[], xp: number): number {
  const current = getStage(stages, xp)
  const next = getNextStage(stages, xp)
  if (!next) return 1
  const span = next.minXp - current.minXp
  const done = xp - current.minXp
  return Math.min(1, Math.max(0, done / span))
}
