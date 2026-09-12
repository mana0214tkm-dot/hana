'use client'

// 花が育つ8段階(種→芽→茎→つぼみ→開花→満開)のイラスト。
// 4本柱すべてで共通の「花」というビジュアル言語を使い、
// 色だけを呼び出し側のテーマ(--pillar-accent など)に追従させることで
// 統一感のあるときめきデザインにしている。
export default function FlowerStage({ level, size = 100 }: { level: number; size?: number }) {
  const lv = Math.max(0, Math.min(7, level))

  const stemHeight = [0, 16, 28, 38, 46, 50, 52, 54][lv]
  const leafScale = [0, 0.45, 0.7, 0.95, 1, 1, 1, 1][lv]
  const showSeed = lv === 0
  const showStem = lv >= 1
  const showBud = lv === 3 || lv === 4
  const budSize = lv === 3 ? 6 : 9
  const petalOpacity = lv === 5 ? 0.6 : lv >= 6 ? 1 : 0
  const petalScale = lv === 5 ? 0.75 : 1
  const showSecondFlower = lv === 7
  const showSparkle = lv >= 6

  const topY = 90 - stemHeight

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="flower-stage-svg"
      role="img"
      aria-label={`成長段階 ${lv + 1}`}
    >
      {/* 土台 */}
      <ellipse cx="50" cy="91" rx="27" ry="6" className="flower-soil" />

      {/* 種(レベル0) */}
      {showSeed && <ellipse cx="50" cy="85" rx="5" ry="4" className="flower-seed" />}

      {/* 茎 */}
      {showStem && (
        <path
          d={`M50,90 Q${50 - stemHeight * 0.12},${90 - stemHeight * 0.55} 50,${topY}`}
          className="flower-stem"
          fill="none"
        />
      )}

      {/* 葉 */}
      {showStem && (
        <>
          <ellipse
            cx={50 - 10 * leafScale}
            cy={90 - stemHeight * 0.4}
            rx={9 * leafScale}
            ry={5 * leafScale}
            className="flower-leaf"
            transform={`rotate(-25 ${50 - 10 * leafScale} ${90 - stemHeight * 0.4})`}
          />
          <ellipse
            cx={50 + 10 * leafScale}
            cy={90 - stemHeight * 0.68}
            rx={9 * leafScale}
            ry={5 * leafScale}
            className="flower-leaf"
            transform={`rotate(25 ${50 + 10 * leafScale} ${90 - stemHeight * 0.68})`}
          />
        </>
      )}

      {/* つぼみ */}
      {showBud && <ellipse cx="50" cy={topY} rx={budSize} ry={budSize + 3} className="flower-bud" />}

      {/* 花(開花〜満開) */}
      {lv >= 5 && (
        <g
          className="flower-bloom"
          style={{ opacity: petalOpacity }}
          transform={`translate(50 ${topY}) scale(${petalScale})`}
        >
          {[0, 60, 120, 180, 240, 300].map(angle => (
            <ellipse key={angle} cx={0} cy={-9} rx="7" ry="10" className="flower-petal" transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="6" className="flower-center" />
        </g>
      )}

      {/* レベル7限定:寄り添う2輪目 */}
      {showSecondFlower && (
        <g
          className="flower-bloom flower-bloom-second"
          transform={`translate(${50 - 20} ${90 - stemHeight * 0.55})`}
        >
          {[0, 72, 144, 216, 288].map(angle => (
            <ellipse key={angle} cx={0} cy={-6} rx="5" ry="7" className="flower-petal" transform={`rotate(${angle})`} />
          ))}
          <circle cx="0" cy="0" r="4" className="flower-center" />
        </g>
      )}

      {/* きらめき(満開以降) */}
      {showSparkle && (
        <>
          <text x="74" y="34" className="flower-sparkle">✨</text>
          <text x="20" y="46" className="flower-sparkle">✨</text>
        </>
      )}
    </svg>
  )
}
