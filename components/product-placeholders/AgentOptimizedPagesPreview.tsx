import styles from "./ProductPreviews.module.css"

const structureCards = [
  {
    title: "Page Title",
    body: "AI Influence Analytics Platform",
  },
  {
    title: "Summary Block",
    body: "Readable helps teams monitor AI visibility and agent traffic with actionable performance insights.",
  },
  {
    title: "Key Capabilities",
    items: ["AI Influence tracking", "Agent traffic analytics", "AI-optimized landing pages"],
  },
  {
    title: "FAQ Block",
    items: ["What is AI Influence?", "How do AI agents discover websites?"],
  },
]

const structureSignals = [
  { label: "Schema markup detected", value: "Product schema" },
  { label: "Entity references", value: "AI analytics platform" },
  { label: "Structured headings", value: "H1 / H2 hierarchy" },
  { label: "Internal linking", value: "Contextual links detected" },
]

const contentSignals = [
  { label: "Clear page summary", value: "detected", positive: true },
  { label: "FAQ extraction blocks", value: "detected", positive: true },
  { label: "Schema markup", value: "detected", positive: true },
  { label: "Entity alignment", value: "moderate", positive: false },
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
            <p className={styles.label}>AGENT-READY PAGE PREVIEW</p>
            <p className={styles.previewDomain}>YourBrand.com</p>
          </div>

          <div className={styles.platformChipRow}>
            {["Schema", "Entity", "FAQ", "Internal Links"].map((chip) => (
              <span key={chip} className={styles.platformChip}>
                {chip}
              </span>
            ))}
          </div>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>PAGE STRUCTURE VISUALIZATION</p>
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

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>AI STRUCTURE SIGNALS</p>
            <div className={styles.signalStack}>
              {structureSignals.map((signal) => (
                <div key={signal.label} className={styles.signalRow}>
                  <span className={styles.metricMuted}>{signal.label}</span>
                  <span className={styles.signalValue}>
                    <span className={styles.signalGood} aria-hidden="true">
                      ✓
                    </span>
                    {signal.value}
                  </span>
                </div>
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
            <p className={styles.previewDomain}>YourBrand.com</p>
          </div>

          <div className={styles.platformChipRow}>
            {["Schema", "Entity", "FAQ", "Internal Links"].map((chip) => (
              <span key={chip} className={styles.platformChip}>
                {chip}
              </span>
            ))}
          </div>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>CONTENT CLARITY SCORE</p>
            <div className={styles.scoreCard}>
              <div>
                <p className={styles.metricMuted}>AI Readability Score</p>
                <p className={styles.scoreValue}>82 / 100</p>
              </div>
              <div className={styles.scoreTrack}>
                <div className={styles.scoreFill} style={{ width: "82%" }} />
              </div>
            </div>
          </section>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>AI CONTENT SIGNALS</p>
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
            <p className={styles.subLabel}>AI RETRIEVAL PREVIEW</p>
            <article className={styles.quoteCard}>
              <p className={styles.quoteLabel}>HOW AI SYSTEMS MAY CITE THIS PAGE</p>
              <p className={styles.quoteText}>
                "YourBrand provides an AI analytics platform that helps companies track how AI assistants
                influence brand discovery and website traffic."
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
