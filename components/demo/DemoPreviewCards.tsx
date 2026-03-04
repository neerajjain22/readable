import styles from "./DemoPreviewCards.module.css"

const aiInfluenceRows = [
  { name: "Comfort", width: "78%" },
  { name: "Performance", width: "54%" },
  { name: "Durability", width: "60%" },
  { name: "Price", width: "44%" },
  { name: "Beginner-friendly", width: "82%" },
]

const sourceRows = [
  { name: "ChatGPT", value: "5,153 visits", width: "92%" },
  { name: "Perplexity", value: "157 visits", width: "56%" },
  { name: "Gemini", value: "38 visits", width: "28%" },
  { name: "Claude", value: "18 visits", width: "18%" },
]

const funnelRows = [
  { name: "AI Agent Visits", width: "94%" },
  { name: "Website Visits", width: "72%" },
  { name: "Product Views", width: "42%" },
  { name: "Conversions", width: "16%" },
]

export function AIInfluenceDemoPreview() {
  return (
    <div className={styles.previewCard}>
      <p className={styles.label}>Attribute</p>
      <div className={styles.stack}>
        {aiInfluenceRows.map((row) => (
          <div key={row.name} className={styles.row}>
            <p className={styles.name}>{row.name}</p>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: row.width }} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.ghostPanels}>
        <div className={styles.ghostPanel} />
        <div className={styles.ghostPanel} />
      </div>
    </div>
  )
}

export function AgentAnalyticsDemoPreview() {
  return (
    <div className={styles.previewCard}>
      <p className={styles.label}>AI Agent Sources</p>
      <div className={styles.stack}>
        {sourceRows.map((row) => (
          <div key={row.name} className={styles.row}>
            <div className={styles.rowHeader}>
              <p className={styles.name}>{row.name}</p>
              <p className={styles.value}>{row.value}</p>
            </div>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: row.width }} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider}>
        <p className={styles.label}>Funnel</p>
        <div className={styles.stack}>
          {funnelRows.map((row) => (
            <div key={row.name} className={styles.row}>
              <p className={styles.name}>{row.name}</p>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: row.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AgentPagesDemoPreview() {
  return (
    <div className={styles.previewCard}>
      <p className={styles.label}>AI Assistant</p>
      <div className={styles.dropdown}>Assistant Selector ▾</div>

      <div className={styles.dualGrid}>
        <div className={styles.miniCard}>
          <p className={styles.miniTitle}>Human Experience</p>
          <div className={`${styles.line} ${styles.lineLg}`} />
          <div className={`${styles.line} ${styles.lineMd}`} />
          <div className={`${styles.line} ${styles.lineSm}`} />
          <button type="button" className={styles.buy}>
            Buy
          </button>
        </div>

        <div className={styles.miniCard}>
          <p className={styles.miniTitle}>AI Agent Experience</p>
          <div className={`${styles.line} ${styles.lineLg}`} />
          <div className={`${styles.line} ${styles.lineMd}`} />
          <div className={`${styles.line} ${styles.lineSm}`} />
          <div className={`${styles.line} ${styles.lineMd}`} />
        </div>
      </div>
    </div>
  )
}
