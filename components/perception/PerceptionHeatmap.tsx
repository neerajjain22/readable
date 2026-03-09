import type { HeadToHeadSummary } from "../../lib/perception-blogs/utils"
import styles from "../../styles/components/PerceptionHeatmap.module.css"

type PerceptionHeatmapProps = {
  summary: HeadToHeadSummary
}

function cellClass(inputScore: number, competitorScore: number): string {
  const diff = inputScore - competitorScore
  if (diff > 0.5) return styles.win
  if (diff < -0.5) return styles.lose
  return styles.tie
}

export default function PerceptionHeatmap({ summary }: PerceptionHeatmapProps) {
  if (summary.competitors.length === 0) {
    return null
  }

  // Collect all unique parameters in order from first competitor
  const parameters = summary.competitors[0]?.params.map((p) => p.parameter) || []

  // Build a lookup: paramName -> competitorName -> { input_score, competitor_score }
  const lookup = new Map<string, Map<string, { input: number; competitor: number }>>()
  for (const comp of summary.competitors) {
    for (const p of comp.params) {
      if (!lookup.has(p.parameter)) {
        lookup.set(p.parameter, new Map())
      }
      lookup.get(p.parameter)!.set(comp.name, {
        input: p.input_score,
        competitor: p.competitor_score,
      })
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Head-to-Head Comparison</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Parameter</th>
            <th className={styles.inputColHeader}>{summary.input_company}</th>
            {summary.competitors.map((c) => (
              <th key={c.name}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => {
            const paramData = lookup.get(param)
            // Use input score from first competitor (same across all matchups)
            const firstComp = summary.competitors[0]?.name || ""
            const inputScore = paramData?.get(firstComp)?.input ?? 0

            return (
              <tr key={param}>
                <td>{param}</td>
                <td className={styles.inputCol}>{inputScore}</td>
                {summary.competitors.map((comp) => {
                  const data = paramData?.get(comp.name)
                  const compScore = data?.competitor ?? 0
                  const inScore = data?.input ?? 0

                  return (
                    <td key={comp.name} className={cellClass(inScore, compScore)}>
                      {compScore}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
