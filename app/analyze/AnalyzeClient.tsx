"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

type GenerateResponse = {
  success: boolean
  companySlug?: string
  status?: string
  redirectNow?: boolean
  error?: string
}

type StatusResponse = {
  success: boolean
  status?: string
  error?: string
}

const PROGRESS_STEPS = [
  "Analyzing website",
  "Detecting competitors",
  "Evaluating AI descriptions",
  "Analyzing buyer queries",
  "Generating AI visibility report",
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

  const completedStepCount = useMemo(() => {
    if (!running) {
      return 0
    }

    return Math.min(PROGRESS_STEPS.length - 1, stepIndex)
  }, [running, stepIndex])

  async function pollStatus(slug: string) {
    const response = await fetch(`/api/ai-visibility/status?companySlug=${encodeURIComponent(slug)}`, {
      method: "GET",
      cache: "no-store",
    })

    const payload = (await response.json()) as StatusResponse

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "Failed to read report status")
    }

    return payload.status
  }

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

      if (payload.redirectNow || payload.status === "completed") {
        window.clearInterval(progressInterval)
        router.push(`/ai-visibility/${payload.companySlug}`)
        return
      }

      setCompanySlug(payload.companySlug)

      const interval = window.setInterval(async () => {
        try {
          const status = await pollStatus(payload.companySlug as string)

          if (status === "completed") {
            window.clearInterval(progressInterval)
            window.clearInterval(interval)
            router.push(`/ai-visibility/${payload.companySlug}`)
            return
          }

          if (status === "failed") {
            window.clearInterval(progressInterval)
            window.clearInterval(interval)
            setRunning(false)
            setError("Report generation failed. Please try again.")
          }
        } catch {
          window.clearInterval(progressInterval)
          window.clearInterval(interval)
          setRunning(false)
          setError("Unable to check report status. Please try again.")
        }
      }, 2500)
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
          {companySlug ? <p className={styles.muted}>Company slug: {companySlug}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
