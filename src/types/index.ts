// そだてキャリア → 人生まるごと育成アプリへ。
// 「仕事」「恋愛・結婚」「推し活」「お金」の4本柱、それぞれに専用のキャラクターと
// 成長ステージを持たせ、日々の記録がそのままときめく成長になる。

export type PillarId = 'career' | 'love' | 'oshi' | 'money'

export interface CategoryInfo {
  id: string
  label: string
  icon: string
  hint: string
  baseXp: number
}

export interface Stage {
  level: number
  name: string
  phase: string
  icon: string
  minXp: number
  message: string
}

export interface Pillar {
  id: PillarId
  label: string
  shortLabel: string
  icon: string
  theme: string // CSS用のテーマクラス名
  tagline: string
  categories: CategoryInfo[]
  stages: Stage[]
}

export interface LogEntry {
  id: number
  date: string // YYYY-MM-DD
  pillar: PillarId
  category: string
  title: string
  note: string
  xp: number
  createdAt: number
  photos?: string[] // 圧縮済み画像のdata URL(複数枚・任意)
}
