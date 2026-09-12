export function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 直近の連続記録日数(ストリーク)を計算する
export function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const uniqueDates = Array.from(new Set(dates)).sort().reverse()
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    if (uniqueDates[i] === expected) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (i === 0) {
      // 今日まだ記録がなくても、昨日から続いていればストリークは有効
      const yesterday = new Date(cursor)
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
      if (uniqueDates[i] === yStr) {
        streak++
        cursor.setDate(cursor.getDate() - 2)
      } else {
        break
      }
    } else {
      break
    }
  }
  return streak
}

// 過去N日間の記録有無を返す(ヒートマップ用)
export function lastNDays(n: number): string[] {
  const days: string[] = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d)
    dd.setDate(d.getDate() - i)
    days.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`)
  }
  return days
}
