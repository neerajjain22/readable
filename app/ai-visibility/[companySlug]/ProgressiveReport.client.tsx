"use client"

import { useEffect, useMemo, useState } from "react"
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

function formatDate(value: string) {
  const date = new Date(value)
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${date.getUTCDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function initialStageFlags(report: ReportPayload): StageFlags {
  const done = report.status === "completed"
  return {
    categoryComplete: done || Boolean(report.category),
    queriesComplete: done || Array.isArray(report.buyerQueries),
    responsesComplete: done || Array.isArray(report.aiResponseSamples),
    attributesComplete: done || (Array.isArray(report.attributes) && Array.isArray(report.competitors)),
    visibilityComplete: done || typeof report.visibilityScore === "number",
    insightsComplete:
      done ||
      (Array.isArray(report.insights) && Array.isArray(report.opportunities) && Array.isArray(report.recommendations)),
  }
}

function SectionState({
  title,
  complete,
  processingText,
  skeleton,
  children,
}: {
  title: string
  complete: boolean
  processingText: string
  skeleton: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {complete ? (
        <div className={styles.fadeIn}>{children}</div>
      ) : (
        <div>
          <p className={styles.processingText}>{processingText}</p>
          {skeleton}
        </div>
      )}
    </>
  )
}

export default function ProgressiveReport({ initialReport }: { initialReport: ReportPayload }) {
  const [report, setReport] = useState<ReportPayload>(initialReport)
  const [flags, setFlags] = useState<StageFlags>(initialStageFlags(initialReport))

  const [status, setStatus] = useState(initialReport.status)
  const isProcessing = status === "processing"
  const isFailed = status === "failed"

  useEffect(() => {
    if (!isProcessing) {
      return
    }

    let stopped = false

    const poll = async () => {
      try {
        const statusResponse = await fetch(`/api/report-status/${encodeURIComponent(report.id)}`, {
          cache: "no-store",
        })
        const statusPayload = (await statusResponse.json()) as StageStatusResponse
        if (!statusResponse.ok || !statusPayload.success || stopped) {
          return
        }

        const nextFlags: StageFlags = {
          categoryComplete: statusPayload.categoryComplete,
          queriesComplete: statusPayload.queriesComplete,
          responsesComplete: statusPayload.responsesComplete,
          attributesComplete: statusPayload.attributesComplete,
          visibilityComplete: statusPayload.visibilityComplete,
          insightsComplete: statusPayload.insightsComplete,
        }

        setFlags(nextFlags)
        setStatus(statusPayload.status)

        const reportResponse = await fetch(`/api/report/${encodeURIComponent(report.id)}`, { cache: "no-store" })
        const reportPayload = (await reportResponse.json()) as { success: boolean; report?: ReportPayload }
        if (reportResponse.ok && reportPayload.success && reportPayload.report && !stopped) {
          setReport(reportPayload.report)
        }
      } catch {
        // keep current UI state and continue polling
      }
    }

    void poll()
    const intervalId = window.setInterval(() => {
      void poll()
    }, 2000)

    return () => {
      stopped = true
      window.clearInterval(intervalId)
    }
  }, [isProcessing, report.id])

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

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.kicker}>AI Visibility Intelligence</p>
          <h1 className={styles.title}>How AI perceives {report.companyName} and influences buyers</h1>
          <p className={styles.subtitle}>
            Category: {flags.categoryComplete && report.category ? report.category : "Analyzing category..."} · Last analyzed:{" "}
            {report.lastAnalyzedAt ? formatDate(report.lastAnalyzedAt) : "Pending"}
          </p>
          <div className={styles.heroCtas}>
            <ReportActions />
            <Link href="/book-demo" className="btn btn-primary">
              Book AI visibility audit
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Report generation progress</h2>
          <ul className={styles.progressListInline}>
            {progressItems.map((item) => (
              <li key={item.key} className={styles.progressItemInline}>
                <span className={styles.statusDot} data-active={item.done} />
                <span>{item.label}{item.done ? "" : "..."}</span>
              </li>
            ))}
          </ul>
          {isFailed ? <p className={styles.errorText}>Report generation failed. Please refresh or retry analysis.</p> : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionState
            title="AI Visibility Score"
            complete={flags.visibilityComplete && typeof report.visibilityScore === "number"}
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
              </div>
            </div>
          </SectionState>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="AI Category Positioning Table"
            complete={flags.attributesComplete && positioningRows.length > 0}
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
                        <td key={`${row.attribute}-${brand.brand}`}>{brand.label}</td>
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
            title="Buyer Query Evidence"
            complete={flags.queriesComplete && buyerQueries.length > 0}
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
          </SectionState>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="AI Response Examples"
            complete={flags.responsesComplete && responseSamples.length > 0}
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
            complete={flags.responsesComplete && competitorVisibility.length > 0}
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
            title="AI Comparison Positioning"
            complete={flags.insightsComplete && insights.length > 0}
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

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionState
            title="Visibility Opportunities"
            complete={flags.insightsComplete && opportunities.length > 0}
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

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <SectionState
            title="Recommendations"
            complete={flags.insightsComplete && recommendations.length > 0}
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
    </main>
  )
}
