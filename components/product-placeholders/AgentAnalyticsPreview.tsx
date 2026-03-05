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

const dashboardMetrics = [
  { icon: "◎", label: "AI Agent Visits", value: "4,812" },
  { icon: "◌", label: "Unique AI Sessions", value: "2,945" },
  { icon: "◆", label: "AI Conversion Influence", value: "12.6%" },
  { icon: "◉", label: "Average Session Depth", value: "3.8 pages" },
]

const trafficSources = [
  { source: "ChatGPT", width: "52%", value: "52%" },
  { source: "Perplexity", width: "19%", value: "19%" },
  { source: "Claude", width: "15%", value: "15%" },
  { source: "Gemini", width: "9%", value: "9%" },
  { source: "Other", width: "5%", value: "5%" },
]

const recentSessions = [
  { source: "ChatGPT", landingPage: "/pricing", pagesViewed: "4", outcome: "Demo Click" },
  { source: "Perplexity", landingPage: "/blog/ai-seo", pagesViewed: "3", outcome: "Signup" },
  { source: "Claude", landingPage: "/platform", pagesViewed: "2", outcome: "Bounce" },
  { source: "Gemini", landingPage: "/solutions", pagesViewed: "5", outcome: "Demo Click" },
]

type AgentAnalyticsPreviewProps = {
  variant?: "compact" | "hero"
}

export default function AgentAnalyticsPreview({ variant = "compact" }: AgentAnalyticsPreviewProps) {
  if (variant === "hero") {
    return (
      <div className={`ui-visual-shell ${styles.shell}`}>
        <article className={`ui-placeholder-panel ${styles.panel}`}>
          <div className={styles.previewHeader}>
            <p className={styles.label}>AGENT ANALYTICS DASHBOARD</p>
            <p className={styles.previewDomain}>YourBrand.com</p>
          </div>

          <div className={styles.platformChipRow}>
            {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((platform) => (
              <span key={platform} className={styles.platformChip}>
                {platform}
              </span>
            ))}
          </div>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>DASHBOARD METRICS</p>
            <div className={styles.metricsStack}>
              {dashboardMetrics.map((metric) => (
                <div key={metric.label} className={styles.metricRow}>
                  <div className={styles.metricMeta}>
                    <span className={styles.metricIcon} aria-hidden="true">
                      {metric.icon}
                    </span>
                    <span className={styles.metricMuted}>{metric.label}</span>
                  </div>
                  <span className={styles.metricEmphasis}>{metric.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>AI TRAFFIC SOURCES</p>
            <div className={styles.sourceStack}>
              {trafficSources.map((item) => (
                <div key={item.source} className={styles.sourceRow}>
                  <span className={styles.metricText}>{item.source}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: item.width }} />
                  </div>
                  <span className={styles.metricValue}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.previewSection}>
            <p className={styles.subLabel}>RECENT AGENT SESSIONS</p>
            <div className={styles.sessionsTable}>
              <div className={styles.tableRowHeader}>
                <span>Source</span>
                <span>Landing Page</span>
                <span>Pages Viewed</span>
                <span>Outcome</span>
              </div>
              {recentSessions.map((session) => (
                <div key={`${session.source}-${session.landingPage}`} className={styles.tableRow}>
                  <span>{session.source}</span>
                  <span>{session.landingPage}</span>
                  <span>{session.pagesViewed}</span>
                  <span>{session.outcome}</span>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    )
  }

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
