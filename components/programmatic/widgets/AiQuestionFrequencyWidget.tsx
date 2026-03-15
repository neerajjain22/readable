import styles from "./widget-pool.module.css"

type AiQuestionFrequencyWidgetProps = {
  questionsJson?: string | null
  frequenciesJson?: string | null
}

function parseQuestions(value?: string | null) {
  if (!value || typeof value !== "string") {
    return []
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5)
  } catch {
    return []
  }
}

function parseFrequencies(value: string | null | undefined, count: number) {
  if (count === 0) {
    return []
  }

  if (value && typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) {
        const numbers = parsed
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item) && item > 0)
          .slice(0, count)

        if (numbers.length === count) {
          return numbers
        }
      }
    } catch {
      // fall through to deterministic default
    }
  }

  return Array.from({ length: count }, (_, index) => Math.max(20, 100 - index * 12))
}

function toRelativePercent(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 0
  }

  return Math.max(8, Math.min(100, Math.round((value / maxValue) * 100)))
}

export default function AiQuestionFrequencyWidget({ questionsJson, frequenciesJson }: AiQuestionFrequencyWidgetProps) {
  const questions = parseQuestions(questionsJson)
  if (questions.length === 0) {
    return null
  }

  const frequencies = parseFrequencies(frequenciesJson, questions.length)
  const maxFrequency = Math.max(...frequencies)

  return (
    <aside className={styles.widgetBox}>
      <p className={styles.title}>AI buyer question frequency snapshot</p>
      <p className={styles.subtitle}>Relative frequency of top questions in this category</p>
      <ul className={styles.barList}>
        {questions.map((question, index) => {
          const frequency = frequencies[index] || 0
          const relativePercent = toRelativePercent(frequency, maxFrequency)
          return (
            <li key={`${question}-${index}`} className={styles.barRow}>
              <div className={styles.barHeader}>
                <span className={styles.barLabel}>{question}</span>
                <span className={styles.barValue}>{relativePercent}%</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${relativePercent}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
