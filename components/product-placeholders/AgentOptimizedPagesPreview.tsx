import styles from "./ProductPreviews.module.css"

const structureCards = [
  {
    title: "Page Title",
    body: "Best Cities to Visit in Europe",
  },
  {
    title: "Short Summary",
    body: "Discover the top destinations across Europe for culture, food, and history.",
  },
  {
    title: "FAQ",
    items: ["Best time to visit Europe?", "Which cities are best for first-time travelers?"],
  },
]

const contentSignals = [
  { label: "Clear page summary", value: "detected", positive: true },
  { label: "Entity references", value: "running shoes, cushioning, stability", positive: true },
  { label: "Structured headings", value: "strong hierarchy", positive: true },
]

type AgentOptimizedPagesPreviewProps = {
  variant?: "compact" | "hero" | "marketing"
}

export default function AgentOptimizedPagesPreview({ variant = "compact" }: AgentOptimizedPagesPreviewProps) {
  if (variant === "hero") {
    return (
      <div className={`ui-visual-shell ${styles.shell}`}>
        <article className={`ui-placeholder-panel ${styles.panel}`}>
          <div className={styles.previewHeader}>
            <p className={styles.label}>AI-READY PAGE STRUCTURE</p>
            <p className={styles.previewDomain}>Travel Booking Guide</p>
          </div>

          <div className={styles.platformChipRow}>
            {["FAQ", "Schema", "Entities"].map((chip) => (
              <span key={chip} className={styles.platformChip}>
                {chip}
              </span>
            ))}
          </div>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>PAGE STRUCTURE PREVIEW</p>
            <div className={styles.docCardStack}>
              {structureCards.map((card) => (
                <article key={card.title} className={styles.docCard}>
                  <div className={styles.docCardHeader}>
                    <span className={styles.docIcon} aria-hidden="true">
                      □
                    </span>
                    <p className={styles.metricMuted}>{card.title}</p>
                  </div>
                  {card.body ? <p className={styles.docCardBody}>{card.body}</p> : null}
                  {card.items ? (
                    <ul className={styles.docCardList}>
                      {card.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </article>
      </div>
    )
  }

  if (variant === "marketing") {
    return (
      <div className={`ui-visual-shell ${styles.shell}`}>
        <article className={`ui-placeholder-panel ${styles.panel}`}>
          <div className={styles.previewHeader}>
            <p className={styles.label}>CONTENT STRUCTURE ANALYSIS</p>
            <p className={styles.previewDomain}>Running Shoes Buying Guide</p>
          </div>

          <div className={styles.platformChipRow}>
            {["FAQ", "Schema", "Entities"].map((chip) => (
              <span key={chip} className={styles.platformChip}>
                {chip}
              </span>
            ))}
          </div>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>CONTENT CLARITY SCORE</p>
            <div className={styles.scoreCard}>
              <div>
                <p className={styles.metricMuted}>AI Clarity Score</p>
                <p className={styles.scoreValue}>84 / 100</p>
              </div>
              <div className={styles.scoreTrack}>
                <div className={styles.scoreFill} style={{ width: "84%" }} />
              </div>
            </div>
          </section>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>CONTENT SIGNALS</p>
            <div className={styles.signalStack}>
              {contentSignals.map((signal) => (
                <div key={signal.label} className={styles.signalRow}>
                  <span className={styles.metricMuted}>{signal.label}</span>
                  <span className={styles.signalValue}>
                    <span className={signal.positive ? styles.signalGood : styles.signalNeutral} aria-hidden="true">
                      {signal.positive ? "✓" : "•"}
                    </span>
                    {signal.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>AI ANSWER PREVIEW</p>
            <article className={styles.quoteCard}>
              <p className={styles.quoteLabel}>HOW AI MAY SUMMARIZE THIS PAGE</p>
              <p className={styles.quoteText}>
                "Running shoes should be selected based on cushioning, stability, and running style. Neutral
                shoes work well for most runners, while stability shoes support over-pronation."
              </p>
            </article>
          </section>
        </article>
      </div>
    )
  }

  return (
    <div className={`ui-visual-shell ${styles.shell}`}>
      <div className={styles.stack}>
        <article className={`ui-placeholder-panel ${styles.panel} ${styles.panelTop}`}>
          <p className={styles.label}>Page Request</p>
          <p className={styles.body}>example.com/running-shoes</p>
          <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
            <p className={styles.subLabel}>Visitor Type Detected</p>
            <div className={styles.visitorGrid}>
              {["Human Visitor", "AI Assistant"].map((label) => (
                <div key={label} className={styles.visitorBadge}>
                  <span className={styles.visitorLabel}>{label}</span>
                  <span className={styles.visitorCheck}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className={`ui-placeholder-panel ${styles.panel} ${styles.panelBottom}`}>
          <p className={styles.label}>Dual Content Delivery</p>
          <div className={styles.dualGrid}>
            <div className={styles.experienceCard}>
              <p className={styles.subLabel}>Human Experience</p>
              <div className={styles.humanBlock}>
                <div className={styles.heroBlock} />
                <div className={styles.line90} />
                <div className={styles.line74} />
                <div className={styles.twoCol}>
                  <div className={styles.ghostBtn} />
                  <div className={styles.buyBtn}>Buy</div>
                </div>
              </div>
            </div>

            <div className={styles.experienceCard}>
              <p className={styles.subLabel}>AI Agent Experience</p>
              <div className={styles.aiBlock}>
                <div className={styles.chip}>Product summary</div>
                <div className={styles.chip}>Key attributes</div>
                <div className={styles.chip}>Specifications</div>
                <div className={styles.chip}>Comparison points</div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
