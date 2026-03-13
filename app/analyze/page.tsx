import type { Metadata } from "next"
import AnalyzeClient from "./AnalyzeClient"
import pageStyles from "../../styles/Page.module.css"
import RotatingText from "../../components/RotatingText"

export const metadata: Metadata = {
  title: "Free AI Audit | Readable",
  description: "See what AI says about your brand and how it drives buyer traffic and decisions.",
}

export default function AnalyzePage({
  searchParams,
}: {
  searchParams?: { domain?: string; refresh?: string }
}) {
  const initialDomain = (searchParams?.domain || "").trim()
  const forceRefresh = searchParams?.refresh === "1"

  return (
    <main className={pageStyles.page}>
      <section
        className={`${pageStyles.section} ${pageStyles.heroSection}`}
        style={{
          paddingTop: "128px",
          paddingBottom: "112px",
        }}
        aria-labelledby="analyze-hero-title"
      >
        <div className={pageStyles.container}>
          <div className={pageStyles.grid2} style={{ gap: "40px", alignItems: "center" }}>
            <div>
              <h1 id="analyze-hero-title" className={pageStyles.heroTitle}>
                Understand How AI Influences Your
                <br />
                <RotatingText words={["Growth", "Buyers"]} />
              </h1>
              <p className={pageStyles.heroDescription} style={{ marginTop: "24px" }}>
                See what AI says about your brand and how it drives buyer traffic and decisions.
              </p>
              <AnalyzeClient initialDomain={initialDomain} forceRefresh={forceRefresh} />
            </div>

            <div className={pageStyles.heroVisualShell}>
              <div className={pageStyles.heroVisualPanel}>
                <div className={pageStyles.heroVisualCard}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#6B7280",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    AI Influence Snapshot
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    Analyzing: hubspot.com
                  </p>
                </div>

                <article className={pageStyles.heroVisualCard}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#6B7280",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    Hubspot AI Influence Score
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: 600, lineHeight: 1.1 }}>
                    74 / 100
                  </p>
                  <div
                    aria-hidden="true"
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      height: "8px",
                      borderRadius: "999px",
                      background: "#E5E7EB",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "74%",
                        height: "100%",
                        background: "var(--color-accent)",
                      }}
                    />
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    Top AI Associations
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    • marketing automation
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    • CRM platform
                  </p>
                  <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    Missing Topics
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    • enterprise security
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.4 }}>
                    • customer data governance
                  </p>
                </article>

                <article className={pageStyles.heroVisualCard}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#6B7280",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    How AI Describes Hubspot.com
                  </p>
                  <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#4B5563", lineHeight: 1.6 }}>
                    "HubSpot is frequently described as a CRM and marketing automation platform for
                    scaling inbound and revenue operations."
                  </p>
                  <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap", minWidth: 0 }}>
                    {["ChatGPT", "Claude", "Gemini", "Perplexity"].map((source, index) => (
                      <span
                        key={`${source}-${index}`}
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: "#EEF2FF",
                          color: "#4338CA",
                          lineHeight: 1.3,
                        }}
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
