import styles from "./ProductPreviews.module.css"

const sources = [
  { source: "ChatGPT", width: "92%", visits: "5,153 visits" },
  { source: "Perplexity", width: "56%", visits: "157 visits" },
  { source: "Gemini", width: "28%", visits: "38 visits" },
  { source: "Claude", width: "18%", visits: "18 visits" },
]

const funnel = [
  { stage: "AI Agent Visits", width: "94%", value: "5,366" },
  { stage: "Website Visits", width: "72%", value: "2,740" },
  { stage: "Product Views", width: "42%", value: "812" },
  { stage: "Conversions", width: "16%", value: "64" },
]

export default function AgentAnalyticsPreview() {
  return (
    <div className={`ui-visual-shell ${styles.shell}`}>
      <div className={`${styles.stack} ${styles.stackCompact}`}>
        <article className={`ui-placeholder-panel ${styles.panel} ${styles.panelTop}`}>
          <p className={styles.label}>AI Agent Sources</p>
          <div className={styles.grid}>
            {sources.map((item) => (
              <div key={item.source} className={`${styles.row} ${styles.agentSourceRow}`}>
                <span className={styles.metricText}>{item.source}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: item.width }} />
                </div>
                <span className={styles.metricValue}>{item.visits}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={`ui-placeholder-panel ${styles.panel} ${styles.panelBottom}`}>
          <p className={styles.label}>AI-Influenced Funnel</p>
          <div className={styles.grid}>
            {funnel.map((item) => (
              <div key={item.stage} className={`${styles.row} ${styles.agentFunnelRow}`}>
                <span className={styles.metricText}>{item.stage}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: item.width }} />
                </div>
                <span className={styles.metricValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
