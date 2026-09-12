// 画面全体にふわふわ漂うハート・きらめきを配置する装飾コンポーネント。
// 完全に見た目だけの要素なので、操作を邪魔しないよう pointer-events は無効にしている。
const ITEMS = ['💖', '✨', '💫', '🌸', '💗', '⭐', '💛', '🌷']

export default function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {ITEMS.map((icon, i) => (
        <span
          key={i}
          className="floating-heart"
          style={{
            left: `${(i * 12.5 + 4) % 100}%`,
            animationDelay: `${i * 1.7}s`,
            animationDuration: `${14 + (i % 5) * 3}s`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  )
}
