import styles from "./widget-pool.module.css"

type CitationDistribution = {
  documentation: number
  comparison: number
  blog: number
  product: number
  forums: number
}

type AiCitationDistributionWidgetProps = {
  dataJson?: string | null
}

function parseData(dataJson?: string | null): CitationDistribution | null {
  if (!dataJson || typeof dataJson !== "string") {
    return null
  }

  try {
    const parsed = JSON.parse(dataJson) as Partial<CitationDistribution>
    const data: CitationDistribution = {
      documentation: Number(parsed.documentation) || 0,
      comparison: Number(parsed.comparison) || 0,
      blog: Number(parsed.blog) || 0,
      product: Number(parsed.product) || 0,
      forums: Number(parsed.forums) || 0,
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

export default function AiCitationDistributionWidget({ dataJson }: AiCitationDistributionWidgetProps) {
  const data = parseData(dataJson)
  if (!data) {
    return null
  }

  const rows = [
    { label: "Documentation pages", value: data.documentation },
    { label: "Comparison pages", value: data.comparison },
    { label: "Blog articles", value: data.blog },
    { label: "Product pages", value: data.product },
    { label: "Forums", value: data.forums },
  ]

  return (
    <aside className={styles.widgetBox}>
      <p className={styles.title}>Where AI assistants usually cite answers</p>
      <p className={styles.subtitle}>Estimated citation source mix for this industry</p>
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
