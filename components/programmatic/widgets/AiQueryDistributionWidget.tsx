import styles from "./widget-pool.module.css"

type QueryDistribution = {
  bestPlatform: number
  comparisons: number
  integrations: number
  howItWorks: number
  pricing: number
}

type AiQueryDistributionWidgetProps = {
  dataJson?: string | null
}

function parseData(dataJson?: string | null): QueryDistribution | null {
  if (!dataJson || typeof dataJson !== "string") {
    return null
  }

  try {
    const parsed = JSON.parse(dataJson) as Partial<QueryDistribution>
    const data: QueryDistribution = {
      bestPlatform: Number(parsed.bestPlatform) || 0,
      comparisons: Number(parsed.comparisons) || 0,
      integrations: Number(parsed.integrations) || 0,
      howItWorks: Number(parsed.howItWorks) || 0,
      pricing: Number(parsed.pricing) || 0,
    }

    const hasSignal = Object.values(data).some((value) => value > 0)
    return hasSignal ? data : null
  } catch {
    return null
  }
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export default function AiQueryDistributionWidget({ dataJson }: AiQueryDistributionWidgetProps) {
  const data = parseData(dataJson)
  if (!data) {
    return null
  }

  const rows = [
    { label: "Best platform queries", value: data.bestPlatform },
    { label: "Comparison queries", value: data.comparisons },
    { label: "Integration questions", value: data.integrations },
    { label: "How-it-works queries", value: data.howItWorks },
    { label: "Pricing questions", value: data.pricing },
  ]

  return (
    <aside className={styles.widgetBox}>
      <p className={styles.title}>What buyers ask AI assistants most</p>
      <p className={styles.subtitle}>Estimated query mix in this category</p>
      <ul className={styles.barList}>
        {rows.map((row) => {
          const percent = clampPercent(row.value)
          return (
            <li key={row.label} className={styles.barRow}>
              <div className={styles.barHeader}>
                <span className={styles.barLabel}>{row.label}</span>
                <span className={styles.barValue}>{percent}%</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${percent}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
