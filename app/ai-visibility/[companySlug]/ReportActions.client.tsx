"use client"

import { useEffect, useState } from "react"
import styles from "./page.module.css"

export default function ReportActions() {
  const [copied, setCopied] = useState(false)

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

  return (
    <div className={styles.copyWrap}>
      <button type="button" className="btn btn-secondary" onClick={() => void handleCopyLink()}>
        Copy report link
      </button>
      {copied ? <span className={styles.copyFeedback}>URL copied</span> : null}
    </div>
  )
}
