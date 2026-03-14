"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import ReportActions from "./ReportActions.client"
import {
  parseCompetitorVisibility,
  parsePositioningTable,
  parseQueryRows,
  parseResponseSamples,
  parseStringList,
  toPercent,
} from "../../../lib/ai-visibility/view-model"
import styles from "./page.module.css"

type ReportPayload = {
  id: string
  companySlug: string
  companyName: string
  category: string | null
  visibilityScore: number | null
  competitors: unknown
  attributes: unknown
  buyerQueries: unknown
  comparisonQueries: unknown
  perceptionEvidence: unknown
  competitorVisibility: unknown
  aiResponseSamples: unknown
  insights: unknown
  opportunities: unknown
  recommendations: unknown
  status: string
  createdAt: string
  updatedAt: string
  lastAnalyzedAt: string
}

type StageFlags = {
  categoryComplete: boolean
  queriesComplete: boolean
  responsesComplete: boolean
  attributesComplete: boolean
  visibilityComplete: boolean
  insightsComplete: boolean
}

type StageStatusResponse = StageFlags & {
  success: boolean
  status: string
  reportId: string
  error?: string
}

const REPORT_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]

function hasArrayContent(value: unknown) {
  return Array.isArray(value) && value.length > 0
}

function normalizeReportStatus(status: string): ReportStatus {
  if (status === REPORT_STATUS.COMPLETED) return REPORT_STATUS.COMPLETED
  if (status === REPORT_STATUS.FAILED) return REPORT_STATUS.FAILED
  return REPORT_STATUS.PROCESSING
}

function formatDate(value: string) {
  const date = new Date(value)
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${date.getUTCDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isValidAnalyzedDate(value: string) {
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.getUTCFullYear() > 1970
}

function stripTldSuffix(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !/^(com|net|org|io|ai|app|co|dev|tech|in|us|uk)$/i.test(token))
    .join(" ")
}

function displayCompanyName(name: string) {
  const cleaned = stripTldSuffix(name).trim()
  return cleaned || name
}

function initialStageFlags(report: ReportPayload): StageFlags {
  const done = report.status === REPORT_STATUS.COMPLETED
  return {
    categoryComplete: done || Boolean(report.category),
    queriesComplete: done || hasArrayContent(report.buyerQueries),
    responsesComplete: done || hasArrayContent(report.aiResponseSamples),
    attributesComplete: done || (hasArrayContent(report.attributes) && hasArrayContent(report.competitors)),
    visibilityComplete: done || typeof report.visibilityScore === "number",
    insightsComplete:
      done ||
      (hasArrayContent(report.insights) && hasArrayContent(report.opportunities) && hasArrayContent(report.recommendations)),
  }
}

function SectionState({
  title,
  complete,
  failed,
  processingText,
  failureText,
  skeleton,
  children,
}: {
  title: string
  complete: boolean
  failed: boolean
  processingText: string
  failureText?: string
  skeleton: React.ReactNode
  children: React.ReactNode
}) {
  if (complete) {
    return (
      <>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.fadeIn}>{children}</div>
      </>
    )
  }

  if (failed) {
    return (
      <>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.errorText}>{failureText || "Unable to generate this section because report generation failed."}</p>
      </>
    )
  }

  return (
    <>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div>
        <p className={styles.processingText}>{processingText}</p>
        {skeleton}
      </div>
    </>
  )
}

function renderRatingBadge(value: string) {
  if (value === "Strong") {
    return <span className={`${styles.ratingPill} ${styles.ratingStrong}`}>Strong</span>
  }

  if (value === "Moderate") {
    return <span className={`${styles.ratingPill} ${styles.ratingModerate}`}>Moderate</span>
  }

  if (value === "Limited") {
    return <span className={`${styles.ratingPill} ${styles.ratingLimited}`}>Limited</span>
  }

  return value
}

function stageFlagsChanged(previous: StageFlags, next: StageFlags) {
  return (
    previous.categoryComplete !== next.categoryComplete ||
    previous.queriesComplete !== next.queriesComplete ||
    previous.responsesComplete !== next.responsesComplete ||
    previous.attributesComplete !== next.attributesComplete ||
    previous.visibilityComplete !== next.visibilityComplete ||
    previous.insightsComplete !== next.insightsComplete
  )
}

function pollingDelayMs(elapsedSeconds: number) {
  if (elapsedSeconds < 30) {
    return Math.max(0, Math.ceil((30 - elapsedSeconds) * 1000))
  }

  if (elapsedSeconds < 150) {
    return 30000
  }

  if (elapsedSeconds < 180) {
    return 15000
  }

  return 5000
}

export default function ProgressiveReport({ initialReport }: { initialReport: ReportPayload }) {
  const [report, setReport] = useState<ReportPayload>(initialReport)
  const [flags, setFlags] = useState<StageFlags>(initialStageFlags(initialReport))
  const [simulatedProgress, setSimulatedProgress] = useState(initialReport.status === "completed" ? 100 : 0)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)
  const startedAtRef = useRef(Date.now())
  const flagsRef = useRef<StageFlags>(initialStageFlags(initialReport))

  const [status, setStatus] = useState<ReportStatus>(normalizeReportStatus(initialReport.status))
  const isProcessing = status === REPORT_STATUS.PROCESSING
  const isFailed = status === REPORT_STATUS.FAILED
  const isCompleted = status === REPORT_STATUS.COMPLETED
  const showLoadingUi = isProcessing
  const generationTips = [
    "AI assistants increasingly influence how buyers discover products.",
    "Brands that appear frequently in AI recommendations capture more discovery traffic.",
    "Readable analyzes thousands of AI responses to understand how brands are positioned.",
    "Many companies underestimate how often AI assistants recommend competitors.",
    "Understanding how AI describes your brand can reveal hidden visibility gaps.",
  ]

  useEffect(() => {
    flagsRef.current = flags
  }, [flags])

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [report.id])

  useEffect(() => {
    if (isCompleted || isFailed) {
      return
    }

    let stopped = false
    let timeoutId: number | undefined

    const scheduleNextPoll = (immediate = false) => {
      if (stopped) {
        return
      }

      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }

      const elapsedSeconds = (Date.now() - startedAtRef.current) / 1000
      const delay = immediate ? 0 : pollingDelayMs(elapsedSeconds)

      timeoutId = window.setTimeout(() => {
        void poll()
      }, delay)
    }

    const poll = async () => {
      try {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          scheduleNextPoll()
          return
        }

        const statusResponse = await fetch(`/api/report-status/${encodeURIComponent(report.id)}`, {
          cache: "no-store",
        })
        const statusPayload = (await statusResponse.json()) as StageStatusResponse
        if (!statusResponse.ok || !statusPayload.success || stopped) {
          scheduleNextPoll()
          return
        }

        const statusFlags: StageFlags = {
          categoryComplete: statusPayload.categoryComplete,
          queriesComplete: statusPayload.queriesComplete,
          responsesComplete: statusPayload.responsesComplete,
          attributesComplete: statusPayload.attributesComplete,
          visibilityComplete: statusPayload.visibilityComplete,
          insightsComplete: statusPayload.insightsComplete,
        }

        const statusFromStatusRoute = normalizeReportStatus(statusPayload.status)
        const previousFlags = flagsRef.current
        setFlags(statusFlags)
        flagsRef.current = statusFlags

        const shouldFetchReport =
          stageFlagsChanged(previousFlags, statusFlags) ||
          statusFromStatusRoute === REPORT_STATUS.COMPLETED ||
          statusFromStatusRoute === REPORT_STATUS.FAILED

        if (shouldFetchReport) {
          const reportMode =
            statusFromStatusRoute === REPORT_STATUS.COMPLETED || statusFromStatusRoute === REPORT_STATUS.FAILED
              ? "full"
              : "partial"
          const reportResponse = await fetch(`/api/report/${encodeURIComponent(report.id)}?mode=${reportMode}`, {
            cache: "no-store",
          })
          const reportPayload = (await reportResponse.json()) as { success: boolean; report?: ReportPayload }
          const hasFreshReport = reportResponse.ok && reportPayload.success && Boolean(reportPayload.report)

          if (hasFreshReport && reportPayload.report) {
            const nextReport = reportPayload.report
            const reportBackedStatus = normalizeReportStatus(nextReport.status)
            const mergedReport = { ...report, ...nextReport }
            setReport((prev) => ({ ...prev, ...nextReport }))
            const nextFlags = initialStageFlags(mergedReport)
            setFlags(nextFlags)
            flagsRef.current = nextFlags
            setStatus(reportBackedStatus)

            if (reportBackedStatus === REPORT_STATUS.COMPLETED || reportBackedStatus === REPORT_STATUS.FAILED) {
              return
            }
          }
        }

        if (statusFromStatusRoute === REPORT_STATUS.FAILED) {
          setStatus(REPORT_STATUS.FAILED)
          return
        }

        if (statusFromStatusRoute === REPORT_STATUS.COMPLETED) {
          // status says completed but report payload isn't fully available yet
          // keep polling until full report can be loaded
          setStatus(REPORT_STATUS.PROCESSING)
          scheduleNextPoll()
          return
        }

        setStatus(REPORT_STATUS.PROCESSING)
        scheduleNextPoll()
      } catch {
        // keep current UI state and continue polling
        scheduleNextPoll()
      }
    }

    const onVisibilityChange = () => {
      if (stopped) {
        return
      }

      if (document.visibilityState === "visible") {
        if (timeoutId) {
          window.clearTimeout(timeoutId)
        }
        scheduleNextPoll(true)
        return
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    scheduleNextPoll()

    return () => {
      stopped = true
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [isCompleted, isFailed, report.id])

  useEffect(() => {
    if (status === REPORT_STATUS.COMPLETED) {
      setSimulatedProgress(100)
      return
    }

    if (status !== REPORT_STATUS.PROCESSING) {
      return
    }

    const startedAt = Date.now()
    const tickMs = 500

    const intervalId = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000
      let nextProgress = 0

      if (elapsedSeconds <= 30) {
        nextProgress = (elapsedSeconds / 30) * 30
      } else {
        const slowPhase = Math.min((elapsedSeconds - 30) / 210, 1)
        const eased = 1 - (1 - slowPhase) * (1 - slowPhase)
        nextProgress = 30 + eased * 65
      }

      setSimulatedProgress((prev) => Math.max(prev, Math.min(95, nextProgress)))
    }, tickMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [status])

  useEffect(() => {
    if (!showLoadingUi) {
      return
    }

    const intervalId = window.setInterval(() => {
      setTipVisible(false)
      window.setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % generationTips.length)
        setTipVisible(true)
      }, 220)
    }, 8000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [showLoadingUi, generationTips.length])

  const buyerQueries = useMemo(() => parseQueryRows(report.buyerQueries), [report.buyerQueries])
  const responseSamples = useMemo(() => parseResponseSamples(report.aiResponseSamples).slice(0, 4), [report.aiResponseSamples])
  const competitorVisibility = useMemo(
    () => parseCompetitorVisibility(report.competitorVisibility),
    [report.competitorVisibility],
  )
  const insights = useMemo(() => parseStringList(report.insights), [report.insights])
  const opportunities = useMemo(() => parseStringList(report.opportunities), [report.opportunities])
  const recommendations = useMemo(() => parseStringList(report.recommendations), [report.recommendations])
  const positioningRows = useMemo(
    () =>
      parsePositioningTable({
        companyName: report.companyName,
        attributes: report.attributes,
        competitors: report.competitors,
        perceptionEvidence: report.perceptionEvidence,
      }),
    [report.companyName, report.attributes, report.competitors, report.perceptionEvidence],
  )

  const progressItems = [
    { key: "category", label: "Website analysis complete", done: flags.categoryComplete },
    { key: "queries", label: "Buyer queries generated", done: flags.queriesComplete },
    { key: "responses", label: "AI responses collected", done: flags.responsesComplete },
    { key: "attributes", label: "Competitors and attributes extracted", done: flags.attributesComplete },
    { key: "visibility", label: "Visibility calculations complete", done: flags.visibilityComplete },
    { key: "insights", label: "Generating insights", done: flags.insightsComplete },
  ]
  const displayName = displayCompanyName(report.companyName)
  const hasValidLastAnalyzedDate = isValidAnalyzedDate(report.lastAnalyzedAt)
  const progressPercent = isCompleted ? 100 : Math.round(simulatedProgress)

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.kicker}>AI Visibility Intelligence</p>
          <h1 className={styles.title}>How AI perceives {displayName} and influences buyers</h1>
          <p className={styles.subtitle}>
            Category: {report.category ? report.category : "Analyzing category..."}
            {hasValidLastAnalyzedDate ? ` · Last analyzed: ${formatDate(report.lastAnalyzedAt)}` : ""}
          </p>
          <div className={styles.heroCtas}>
            <ReportActions reportId={report.id} reportStatus={status} companySlug={report.companySlug} />
            <Link href="/book-demo" className="btn btn-primary">
              Book AI visibility audit
            </Link>
          </div>
          {showLoadingUi ? (
            <div className={styles.progressWrap}>
              <div className={styles.progressTrack} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
                <span className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <p className={styles.progressHelper}>
                Generating your AI visibility report. This usually takes about 3-4 minutes.
              </p>
              <p className={`${styles.progressTip} ${tipVisible ? styles.tipVisible : styles.tipHidden}`}>
                {generationTips[tipIndex]}
              </p>
            </div>
          ) : null}
          {isFailed ? <p className={styles.errorText}>Generation hit an issue. Please retry the analysis.</p> : null}
        </div>
      </section>

      {showLoadingUi ? (
        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Report generation progress</h2>
            <ul className={styles.progressListInline}>
              {progressItems.map((item) => (
                <li key={item.key} className={styles.progressItemInline}>
                  <span className={styles.statusDot} data-active={item.done} />
                  <span className={styles.progressItemLabel}>
                    {item.label}
                    {item.done ? "" : "..."}
                  </span>
                  {item.done ? <span className={styles.progressDonePill}>Done</span> : null}
                </li>
              ))}
            </ul>
            {isFailed ? (
              <p className={styles.errorText}>Report generation failed. Please refresh or retry analysis.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionState
            title="AI Visibility Score"
            complete={typeof report.visibilityScore === "number"}
            failed={isFailed}
            processingText="Computing AI visibility score..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonScore}`} />}
          >
            <div className={styles.scorePanel}>
              <div>
                <p className={styles.scoreValue}>{report.visibilityScore ?? 0}</p>
                <p className={styles.scoreSub}>out of 100</p>
                <p className={styles.lead}>
                  Companies with higher scores are more likely to appear in AI-driven product discovery.
                </p>
                <div className={styles.nudgeRow}>
                  <Link href="/book-demo" className={styles.inlineLink}>
                    Learn how this score is calculated
                  </Link>
                </div>
              </div>
            </div>
          </SectionState>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="AI Category Positioning Table"
            complete={positioningRows.length > 0}
            failed={isFailed}
            processingText="Comparing competitors and extracting attributes..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonTable}`} />}
          >
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Attribute</th>
                    {positioningRows[0]?.brands.map((brand) => (
                      <th key={brand.brand}>{brand.brand}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positioningRows.map((row, index) => (
                    <tr key={`${row.attribute}-${index}`}>
                      <td>{row.attribute}</td>
                      {row.brands.map((brand) => (
                        <td key={`${row.attribute}-${brand.brand}`}>{renderRatingBadge(brand.label)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionState>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionState
            title="AI Comparison Positioning"
            complete={insights.length > 0}
            failed={isFailed}
            processingText="Generating positioning insights..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonText}`} />}
          >
            <ul className={styles.list}>
              {insights.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </SectionState>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="Visibility Opportunities"
            complete={opportunities.length > 0}
            failed={isFailed}
            processingText="Comparing missed recommendation conversations..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonText}`} />}
          >
            <ul className={styles.list}>
              {opportunities.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </SectionState>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionState
            title="Buyer Query Evidence"
            complete={buyerQueries.length > 0}
            failed={isFailed}
            processingText="Generating representative buyer queries..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonTable}`} />}
          >
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>AI Mentions Brand</th>
                  </tr>
                </thead>
                <tbody>
                  {buyerQueries.map((entry, index) => (
                    <tr key={`${entry.querySlug}-${index}`}>
                      <td>
                        <Link href={`/ai-search/${entry.querySlug}`} className={styles.inlineLink}>
                          {entry.query}
                        </Link>
                      </td>
                      <td>{entry.brandMentioned ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.nudgeRow}>
              <Link href="/book-demo" className="btn btn-primary">
                Improve AI visibility
              </Link>
            </div>
          </SectionState>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="AI Response Examples"
            complete={responseSamples.length > 0}
            failed={isFailed}
            processingText="Analyzing AI responses..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonText}`} />}
          >
            <div className={styles.grid3}>
              {responseSamples.map((sample, index) => (
                <article className={styles.card} key={`${sample.query}-${index}`}>
                  <p className={styles.cardTitle}>{sample.query}</p>
                  <p>{sample.excerpt}</p>
                </article>
              ))}
            </div>
          </SectionState>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionState
            title="Competitor Visibility"
            complete={competitorVisibility.length > 0}
            failed={isFailed}
            processingText="Collecting competitor visibility signals..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonTable}`} />}
          >
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>AI Visibility %</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorVisibility.map((row, index) => (
                    <tr key={`${row.brand}-${index}`}>
                      <td>{row.brand}</td>
                      <td>{toPercent(row.visibilityPercent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionState>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="Recommendations"
            complete={recommendations.length > 0}
            failed={isFailed}
            processingText="Finalizing recommendations..."
            skeleton={<div className={`${styles.skeletonBlock} ${styles.skeletonText}`} />}
          >
            <ul className={styles.list}>
              {recommendations.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </SectionState>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How This Analysis Works</h2>
          <p className={styles.lead}>
            Readable analyzes how AI assistants respond to representative buyer queries and how brands are described
            within those responses.
          </p>
          <p className={styles.subtle}>This report includes only a small sample of the prompts analyzed.</p>
          <div className={styles.nudgeRow}>
            <Link href="/book-demo" className={styles.inlineLink}>
              Learn the methodology
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>AI Discovery Risk</h2>
          <p className={styles.lead}>
            Buyers increasingly rely on AI assistants to shortlist vendors. If AI systems do not associate your brand
            with critical category attributes, you may never appear in those recommendations.
          </p>
          <p className={styles.subtle}>
            Readable can help implement these improvements with no effort from your team.
          </p>
          <p className={styles.subtle}>Book a free demo to get started.</p>
          <div className={styles.endCtaRow}>
            <Link href="/analyze" className="btn btn-secondary">
              Analyze your brand
            </Link>
            <Link href="/book-demo" className="btn btn-primary">
              Book a demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
