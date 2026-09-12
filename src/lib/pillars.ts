import type { Pillar, CategoryInfo } from '@/types'

// 4本柱それぞれに、専用のキャラクター育成テーマとカテゴリを持たせる。
// XPのしきい値は共通(0/60/160/320/540/820/1160/1560)にして、
// どの柱も同じペースで育っていくよう揃えている。

const XP_STEPS = [0, 60, 160, 320, 540, 820, 1160, 1560]

export const PILLARS: Pillar[] = [
  {
    id: 'career',
    label: '仕事・キャリア',
    shortLabel: '仕事',
    icon: '🌱',
    theme: 'theme-career',
    tagline: '就活から定年まで。働く日々の記録が成長になる',
    categories: [
      { id: 'jobhunt', label: '就活・転職活動', icon: '📝', hint: 'ES提出、面接、説明会、自己分析など', baseXp: 15 },
      { id: 'study', label: '学び・スキルアップ', icon: '📚', hint: '資格取得、研修、読書、勉強会など', baseXp: 12 },
      { id: 'challenge', label: '挑戦・仕事の成果', icon: '🚀', hint: '新しい仕事、昇進・異動、プロジェクト達成など', baseXp: 20 },
      { id: 'people', label: '人とのつながり', icon: '🤝', hint: '1on1、後輩指導、感謝された、相談したなど', baseXp: 10 },
      { id: 'care', label: '休養・こころのケア', icon: '🌿', hint: 'しっかり休んだ、リフレッシュ、相談したなど', baseXp: 8 },
    ],
    stages: [
      { level: 0, name: 'たね', phase: '就活準備中', icon: '🌰', minXp: XP_STEPS[0], message: 'すべてはここから。小さな一歩が、これからの物語になる。' },
      { level: 1, name: 'ふたば', phase: '就活・内定を目指して', icon: '🌱', minXp: XP_STEPS[1], message: '芽が出た!ES提出や面接、ひとつひとつの挑戦が力になっている。' },
      { level: 2, name: '若葉', phase: '新社会人', icon: '🌿', minXp: XP_STEPS[2], message: '入社おめでとう。まだ不安もあるけど、確かに育ってきている。' },
      { level: 3, name: 'すくすく若木', phase: '仕事に慣れてきた頃', icon: '🌳', minXp: XP_STEPS[3], message: '日々の積み重ねがしっかり根を張ってきた。頼れる存在になりつつある。' },
      { level: 4, name: 'つぼみ', phase: '中堅・後輩ができる頃', icon: '🌷', minXp: XP_STEPS[4], message: 'もうすぐ花開く。周りを支える力も身についてきた証拠。' },
      { level: 5, name: '満開', phase: 'リーダー・管理職として', icon: '🌸', minXp: XP_STEPS[5], message: '満開の花のように、あなたの経験が周りを照らしている。' },
      { level: 6, name: '実り', phase: 'ベテラン・専門家として', icon: '🍎', minXp: XP_STEPS[6], message: '積み重ねてきたものが、確かな実りとなって形になっている。' },
      { level: 7, name: '大樹', phase: '定年・後進を見守る', icon: '🌳✨', minXp: XP_STEPS[7], message: 'ここまで本当にお疲れさまでした。あなたという大樹が、次の誰かの日陰になる。' },
    ],
  },
  {
    id: 'love',
    label: '恋愛・結婚',
    shortLabel: '恋愛',
    icon: '💖',
    theme: 'theme-love',
    tagline: '出会いから金婚式まで。ふたりの物語を育てる',
    categories: [
      { id: 'meet', label: '会った・デート', icon: '💐', hint: 'デート、会いに行った、連絡を取り合ったなど', baseXp: 12 },
      { id: 'confess', label: '気持ちを伝えた', icon: '💌', hint: '告白、気持ちを言葉にした、素直になれたなど', baseXp: 20 },
      { id: 'memory', label: '記念日・思い出づくり', icon: '📸', hint: '記念日を祝った、旅行、特別な体験など', baseXp: 15 },
      { id: 'support', label: '支え合った', icon: '🤲', hint: 'ケンカを乗り越えた、助け合った、話し合ったなど', baseXp: 15 },
      { id: 'selfcare', label: '自分磨き', icon: '💄', hint: '身だしなみ、自己投資、心の準備など', baseXp: 8 },
    ],
    stages: [
      { level: 0, name: 'ひとめぼれ', phase: '恋の予感', icon: '💗', minXp: XP_STEPS[0], message: '恋の予感。ときめきはここから始まる。' },
      { level: 1, name: '淡い恋心', phase: '気になる存在', icon: '💓', minXp: XP_STEPS[1], message: '気持ちが芽生えてきた。ドキドキも大切な一歩。' },
      { level: 2, name: '急接近', phase: '距離が縮まる頃', icon: '💞', minXp: XP_STEPS[2], message: '距離がぐっと縮まってきた。' },
      { level: 3, name: '恋人同士', phase: 'おつきあい', icon: '💑', minXp: XP_STEPS[3], message: 'ふたりの絆が形になってきた。' },
      { level: 4, name: '婚約', phase: '未来を誓う', icon: '💍', minXp: XP_STEPS[4], message: '未来を誓い合う関係へ。' },
      { level: 5, name: '新婚', phase: '新生活のはじまり', icon: '👰🤵', minXp: XP_STEPS[5], message: '新しい生活のはじまり。' },
      { level: 6, name: '夫婦円満', phase: '支え合う日々', icon: '🏡', minXp: XP_STEPS[6], message: '支え合いながら日々を重ねている。' },
      { level: 7, name: '金婚式', phase: '共に歩んだ証', icon: '💎', minXp: XP_STEPS[7], message: '長い年月をともに歩んできた証。ここまで本当におめでとう。' },
    ],
  },
  {
    id: 'oshi',
    label: '推し活',
    shortLabel: '推し活',
    icon: '⭐',
    theme: 'theme-oshi',
    tagline: '推しと歩む毎日。応援がそのまま成長になる',
    categories: [
      { id: 'live', label: '現場参戦', icon: '🎫', hint: 'ライブ、イベント、握手会などに参戦した', baseXp: 20 },
      { id: 'support', label: '投票・応援購入', icon: '🗳️', hint: '投票、グッズ購入、円盤購入など', baseXp: 12 },
      { id: 'content', label: 'コンテンツ履修', icon: '📺', hint: '配信、動画、雑誌などをチェックした', baseXp: 8 },
      { id: 'create', label: '創作・発信', icon: '🎨', hint: 'ファンアート、感想、SNS投稿など', baseXp: 15 },
      { id: 'community', label: '同担と語る', icon: '💬', hint: '友達や同担と推しについて語り合った', baseXp: 10 },
    ],
    stages: [
      { level: 0, name: '見習いファン', phase: '出会ったばかり', icon: '🔰', minXp: XP_STEPS[0], message: '出会ってしまった。ここから始まる推しとの物語。' },
      { level: 1, name: '箱推し予備軍', phase: '気になり始めた頃', icon: '🌟', minXp: XP_STEPS[1], message: '気づけば毎日チェックしてしまう。それも愛。' },
      { level: 2, name: '現場参戦組', phase: '本気を出し始めた', icon: '🎫', minXp: XP_STEPS[2], message: '現場に足を運ぶようになった。推しへの本気度が上がっている。' },
      { level: 3, name: '古参の風格', phase: '推し活が生活の一部に', icon: '📣', minXp: XP_STEPS[3], message: '推し活が生活に馴染んできた。それは幸せなことだと思う。' },
      { level: 4, name: '布教マスター', phase: '愛を発信する側に', icon: '💜', minXp: XP_STEPS[4], message: '気づけば布教する側に。あなたの愛が誰かに届いている。' },
      { level: 5, name: '伝説のオタク', phase: '揺るぎない愛', icon: '👑', minXp: XP_STEPS[5], message: '積み重ねた愛が、もう揺るぎないものになっている。' },
      { level: 6, name: '殿堂入り', phase: '推しと共に歩む', icon: '🏆', minXp: XP_STEPS[6], message: '殿堂入りの域。推しと共に歩んだ時間そのものが宝物。' },
      { level: 7, name: '推しと歩む人生', phase: '一生推す覚悟', icon: '✨🌌', minXp: XP_STEPS[7], message: 'ここまで推し続けたあなたを、心から称えたい。' },
    ],
  },
  {
    id: 'money',
    label: 'お金・資産形成',
    shortLabel: 'お金',
    icon: '💰',
    theme: 'theme-money',
    tagline: '一粒の種銭から、経済的自由の大樹へ',
    categories: [
      { id: 'save', label: '貯金した', icon: '🐷', hint: '先取り貯金、目標達成、節目の貯蓄など', baseXp: 12 },
      { id: 'invest', label: '投資・積立', icon: '📈', hint: '積立投資、NISA、資産運用の実行など', baseXp: 15 },
      { id: 'learn', label: 'お金の勉強', icon: '📖', hint: '本を読んだ、セミナー参加、情報収集など', baseXp: 10 },
      { id: 'budget', label: '家計管理・節約', icon: '🧾', hint: '家計簿をつけた、無駄遣いを見直したなど', baseXp: 8 },
      { id: 'side', label: '副業・収入UP', icon: '💼', hint: '副業、資格取得による昇給、交渉など', baseXp: 20 },
    ],
    stages: [
      { level: 0, name: '一粒の種銭', phase: '資産形成のスタート', icon: '🪙', minXp: XP_STEPS[0], message: 'すべてはこの一粒から。お金と向き合う第一歩。' },
      { level: 1, name: '貯金箱', phase: '貯める習慣づくり', icon: '🐷', minXp: XP_STEPS[1], message: '貯める習慣が身についてきた。小さな積み重ねが未来を作る。' },
      { level: 2, name: '芽吹く家計簿', phase: 'お金の流れが見えてきた', icon: '🌱', minXp: XP_STEPS[2], message: '家計の流れが見えるようになってきた。' },
      { level: 3, name: '積立の木', phase: '投資を始めた頃', icon: '🌳', minXp: XP_STEPS[3], message: 'コツコツ積み立てる力が根を張ってきた。' },
      { level: 4, name: '資産のつぼみ', phase: '資産が育ち始める', icon: '💹', minXp: XP_STEPS[4], message: '資産がゆっくりと育ち始めている。焦らず育てていこう。' },
      { level: 5, name: '実る資産', phase: '資産形成が軌道に乗る', icon: '💰', minXp: XP_STEPS[5], message: '積み上げてきた努力が、確かな実りとなっている。' },
      { level: 6, name: '黄金の木', phase: '経済的な安心感', icon: '🌟🌳', minXp: XP_STEPS[6], message: '安心して未来を描けるようになってきた。' },
      { level: 7, name: '経済的自由', phase: '選べる人生へ', icon: '🏆💎', minXp: XP_STEPS[7], message: 'ここまで積み上げたお金との向き合い方が、選べる人生を作っている。' },
    ],
  },
]

export function getPillar(id: string): Pillar {
  return PILLARS.find(p => p.id === id) ?? PILLARS[0]
}

export function getCategory(pillar: Pillar, categoryId: string): CategoryInfo {
  return pillar.categories.find(c => c.id === categoryId) ?? pillar.categories[0]
}
