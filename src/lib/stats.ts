import type { LogEntry, PillarId } from '@/types'
import { calcStreak } from '@/lib/utils'

// ストアのセレクタは毎回新しいオブジェクトを作ると無限ループの原因になるため、
// 集計処理はここに純粋関数として切り出し、呼び出し側で useMemo によりキャッシュする。

export function xpByPillar(logs: LogEntry[]): Record<PillarId, number> {
  const result: Record<PillarId, number> = { career: 0, love: 0, oshi: 0, money: 0 }
  for (const l of logs) result[l.pillar] += l.xp
  return result
}

export function logsByPillar(logs: LogEntry[], pillar: PillarId): LogEntry[] {
  return logs.filter(l => l.pillar === pillar)
}

export function streakByPillar(logs: LogEntry[], pillar: PillarId): number {
  return calcStreak(logs.filter(l => l.pillar === pillar).map(l => l.date))
}

export function countByCategory(logs: LogEntry[], pillar: PillarId): Record<string, number> {
  const result: Record<string, number> = {}
  for (const l of logs) {
    if (l.pillar !== pillar) continue
    result[l.category] = (result[l.category] || 0) + 1
  }
  return result
}
