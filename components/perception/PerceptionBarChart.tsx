import type { PerceptionScore } from "../../lib/perception-blogs/utils"
import styles from "../../styles/components/PerceptionBarChart.module.css"

type PerceptionBarChartProps = {
  scores: PerceptionScore[]
  inputCompany: string
}

export default function PerceptionBarChart({ scores, inputCompany }: PerceptionBarChartProps) {
  if (scores.length === 0) {
    return null
  }

  const maxScore = 10

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Overall AI Perception Score</h2>
      {scores.map((item) => {
        const widthPct = (item.score / maxScore) * 100
        const isInput = item.name === inputCompany

        return (
          <div key={item.name} className={styles.row}>
            <span className={styles.label}>{item.name}</span>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${isInput ? styles.barFillPrimary : styles.barFillMuted}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className={styles.score}>{item.score}</span>
          </div>
        )
      })}
    </div>
  )
}
