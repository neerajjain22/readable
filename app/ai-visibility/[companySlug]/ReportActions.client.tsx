"use client"

import { useEffect, useState } from "react"
import styles from "./page.module.css"

type ReportActionsProps = {
  reportId: string
  reportStatus: string
  companySlug: string
}

export default function ReportActions({ reportId, reportStatus, companySlug }: ReportActionsProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState("")

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function handleDownloadPdf() {
    if (reportStatus !== "completed" || isDownloading) {
      return
    }

    setIsDownloading(true)
    setDownloadError("")

    try {
      const response = await fetch(`/api/report-pdf/${encodeURIComponent(reportId)}`, {
        method: "GET",
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || "Unable to download PDF right now.")
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = `ai-visibility-report-${companySlug}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      setDownloadError((error as Error)?.message || "Unable to download PDF right now.")
    } finally {
      setIsDownloading(false)
    }
  }

  const canDownload = reportStatus === "completed"

  return (
    <div className={styles.copyWrap}>
      <div className={styles.actionRow}>
        <button type="button" className="btn btn-secondary" onClick={() => void handleCopyLink()}>
          Copy report link
        </button>
        <button
          type="button"
          className={`btn btn-secondary ${!canDownload ? styles.actionDisabled : ""}`}
          disabled={!canDownload || isDownloading}
          onClick={() => void handleDownloadPdf()}
        >
          {isDownloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>
      {copied ? <span className={styles.copyFeedback}>URL copied</span> : null}
      {downloadError ? <span className={styles.copyFeedbackError}>{downloadError}</span> : null}
    </div>
  )
}
