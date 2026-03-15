import styles from "./widget-pool.module.css"

type BuyerJourney = {
  overview: number
  compare: number
  integrations: number
  shortlist: number
}

type AiBuyerJourneyWidgetProps = {
  dataJson?: string | null
}

function parseData(dataJson?: string | null): BuyerJourney | null {
  if (!dataJson || typeof dataJson !== "string") {
    return null
  }

  try {
    const parsed = JSON.parse(dataJson) as Partial<BuyerJourney>
    const data: BuyerJourney = {
      overview: Number(parsed.overview) || 0,
      compare: Number(parsed.compare) || 0,
      integrations: Number(parsed.integrations) || 0,
      shortlist: Number(parsed.shortlist) || 0,
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

export default function AiBuyerJourneyWidget({ dataJson }: AiBuyerJourneyWidgetProps) {
  const data = parseData(dataJson)
  if (!data) {
    return null
  }

  const steps = [
    { label: "Ask AI for overview", value: data.overview },
    { label: "Compare vendors", value: data.compare },
    { label: "Evaluate integrations", value: data.integrations },
    { label: "Shortlist vendors", value: data.shortlist },
  ]

  return (
    <aside className={styles.widgetBox}>
      <p className={styles.title}>How buyers use AI in their evaluation journey</p>
      <p className={styles.subtitle}>Typical stage progression in this category</p>
      <ul className={styles.stepList}>
        {steps.map((step, index) => {
          const percent = clampPercent(step.value)
          return (
            <li key={step.label} className={styles.stepItem}>
              <span className={styles.stepIndex}>{index + 1}</span>
              <div>
                <div className={styles.stepText}>
                  <span>{step.label}</span>
                  <span className={styles.barValue}>{percent}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${percent}%` }} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
