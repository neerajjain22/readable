"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

type GenerateResponse = {
  success: boolean
  companySlug?: string
  status?: string
  startedGeneration?: boolean
  redirectNow?: boolean
  error?: string
  requestId?: string
}

const PROGRESS_STEPS = [
  "Analyzing website",
  "Detecting competitors",
  "Evaluating AI descriptions",
  "Analyzing buyer queries",
  "Generating AI visibility report",
]

const FINAL_STEP_STATUSES = [
  "Analyzing AI response patterns",
  "Comparing competitor visibility",
  "Computing AI visibility score",
  "Generating positioning insights",
  "Finalizing report data",
]

export default function AnalyzeClient({
  initialDomain,
  forceRefresh,
}: {
  initialDomain: string
  forceRefresh: boolean
}) {
  const router = useRouter()
  const [domain, setDomain] = useState(initialDomain)
  const [error, setError] = useState("")
  const [running, setRunning] = useState(false)
  const [companySlug, setCompanySlug] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [finalStatusIndex, setFinalStatusIndex] = useState(0)
  const [ellipsisCount, setEllipsisCount] = useState(1)

  const completedStepCount = useMemo(() => {
    if (!running) {
      return 0
    }

    return Math.min(PROGRESS_STEPS.length - 1, stepIndex)
  }, [running, stepIndex])

  const finalStepActive = running && completedStepCount >= PROGRESS_STEPS.length - 1

  useEffect(() => {
    if (!finalStepActive) {
      setFinalStatusIndex(0)
      setEllipsisCount(1)
      return
    }

    const statusInterval = window.setInterval(() => {
      setFinalStatusIndex((prev) => (prev + 1) % FINAL_STEP_STATUSES.length)
    }, 2000)

    const dotsInterval = window.setInterval(() => {
      setEllipsisCount((prev) => (prev % 3) + 1)
    }, 500)

    return () => {
      window.clearInterval(statusInterval)
      window.clearInterval(dotsInterval)
    }
  }, [finalStepActive])

  const finalStepMessage = `${FINAL_STEP_STATUSES[finalStatusIndex]}${".".repeat(ellipsisCount)}`

  async function startAnalysis(requestedDomain: string, shouldForceRefresh: boolean) {
    const trimmed = requestedDomain.trim()
    if (!trimmed) {
      setError("Please enter a valid website URL.")
      return
    }

    setError("")
    setRunning(true)
    setStepIndex(0)
    let ticks = 0
    const progressInterval = window.setInterval(() => {
      ticks += 1
      setStepIndex(Math.min(PROGRESS_STEPS.length - 1, Math.floor(ticks / 2)))
    }, 2000)

    try {
      const response = await fetch("/api/ai-visibility/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: trimmed,
          forceRefresh: shouldForceRefresh,
        }),
      })

      const payload = (await response.json()) as GenerateResponse

      if (!response.ok || !payload.success || !payload.companySlug) {
        throw new Error(payload.error || "Failed to start report generation")
      }

      setCompanySlug(payload.companySlug)
      window.clearInterval(progressInterval)
      router.push(`/ai-visibility/${payload.companySlug}`)
    } catch (error) {
      window.clearInterval(progressInterval)
      setRunning(false)
      setError(error instanceof Error ? error.message : "Unable to start analysis")
    }
  }

  useEffect(() => {
    if (!initialDomain) {
      return
    }

    void startAnalysis(initialDomain, forceRefresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDomain, forceRefresh])

  return (
    <div className={styles.card}>
      <div className={styles.formRow}>
        <input
          type="url"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="Enter your website URL"
          className={styles.input}
          aria-label="Website URL"
          disabled={running}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void startAnalysis(domain, forceRefresh)}
          disabled={running}
        >
          {running ? "Analyzing..." : "Generate Report"}
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {running ? (
        <div className={styles.progressCard}>
          <p className={styles.progressTitle}>Report generation in progress</p>
          <ul className={styles.progressList}>
            {PROGRESS_STEPS.map((step, index) => (
              <li key={step} className={styles.progressItem}>
                <span className={styles.statusDot} data-active={index <= completedStepCount} />
                <span>{step}</span>
              </li>
            ))}
          </ul>
          {finalStepActive ? (
            <p className={styles.finalStepSubStatus} aria-live="polite">
              {finalStepMessage}
            </p>
          ) : null}
          <div className={styles.progressBar} aria-hidden="true">
            <span className={styles.progressBarIndicator} />
          </div>
          {companySlug ? <p className={styles.muted}>Company slug: {companySlug}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
