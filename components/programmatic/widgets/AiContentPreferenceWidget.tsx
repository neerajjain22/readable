import styles from "./widget-pool.module.css"

type ContentPreference = {
  documentation: number
  comparisonPages: number
  faqSections: number
  blogPosts: number
  landingPages: number
}

type AiContentPreferenceWidgetProps = {
  dataJson?: string | null
}

function parseData(dataJson?: string | null): ContentPreference | null {
  if (!dataJson || typeof dataJson !== "string") {
    return null
  }

  try {
    const parsed = JSON.parse(dataJson) as Partial<ContentPreference>
    const data: ContentPreference = {
      documentation: Number(parsed.documentation) || 0,
      comparisonPages: Number(parsed.comparisonPages) || 0,
      faqSections: Number(parsed.faqSections) || 0,
      blogPosts: Number(parsed.blogPosts) || 0,
      landingPages: Number(parsed.landingPages) || 0,
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

export default function AiContentPreferenceWidget({ dataJson }: AiContentPreferenceWidgetProps) {
  const data = parseData(dataJson)
  if (!data) {
    return null
  }

  const rows = [
    { label: "Documentation", value: data.documentation },
    { label: "Comparison pages", value: data.comparisonPages },
    { label: "FAQ sections", value: data.faqSections },
    { label: "Blog posts", value: data.blogPosts },
    { label: "Landing pages", value: data.landingPages },
  ]

  const rankedRows = [...rows].sort((a, b) => b.value - a.value)

  return (
    <aside className={styles.widgetBox}>
      <p className={styles.title}>Content formats AI cites most in this market</p>
      <p className={styles.subtitle}>Ranked by estimated citation preference</p>
      <ol className={styles.rankList}>
        {rankedRows.map((row) => {
          const percent = clampPercent(row.value)
          return (
            <li key={row.label} className={styles.rankItem}>
              <span className={styles.rankLabel}>{row.label}</span>
              <span className={styles.barValue}>{percent}%</span>
            </li>
          )
        })}
      </ol>
      <ul className={styles.barList}>
        {rankedRows.map((row) => {
          const percent = clampPercent(row.value)
          return (
            <li key={`${row.label}-bar`} className={styles.barRow}>
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
