"use client"

import { useEffect, useMemo, useState } from "react"
import styles from "./case-studies.module.css"

type CaseStudy = {
  slug: string
  category: string
  industry: string
  result: string
  summary: string
  file: string
}

const VERIFIED_EMAIL_STORAGE_KEY = "readable_verified_case_study_email"

type DownloadResponse = {
  success: boolean
  error?: string
  downloadUrl?: string
}

export default function CaseStudiesClient({ studies }: { studies: CaseStudy[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const stored = window.localStorage.getItem(VERIFIED_EMAIL_STORAGE_KEY)
    if (stored) {
      setEmail(stored)
    }
  }, [])

  const hasStoredEmail = useMemo(() => Boolean(email.trim()), [email])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudy(null)
    setError("")
    setIsLoading(false)
  }

  const openModalForStudy = (study: CaseStudy) => {
    setSelectedStudy(study)
    setIsModalOpen(true)
    setError("")
  }

  const submitDownload = async (targetSlug: string, targetEmail: string) => {
    const response = await fetch("/api/case-study-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: targetEmail,
        slug: targetSlug,
      }),
    })

    const payload = (await response.json()) as DownloadResponse

    if (!response.ok || !payload.success || !payload.downloadUrl) {
      throw new Error(payload.error || "Unable to process download right now. Please try again.")
    }

    return payload
  }

  const triggerDownload = (downloadUrl: string) => {
    window.location.href = downloadUrl
  }

  const onDownloadClick = async (study: CaseStudy) => {
    if (!hasStoredEmail) {
      openModalForStudy(study)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const payload = await submitDownload(study.slug, email)
      setSuccessMessage("Case study download started.")
      triggerDownload(payload.downloadUrl!)
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "Failed to download case study."
      setError(message)
      openModalForStudy(study)
    } finally {
      setIsLoading(false)
    }
  }

  const onRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedStudy) {
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const payload = await submitDownload(selectedStudy.slug, email)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(VERIFIED_EMAIL_STORAGE_KEY, email)
      }

      setSuccessMessage("Case study download started.")
      closeModal()
      triggerDownload(payload.downloadUrl!)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to download case study."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <h1 className={styles.title}>Real Results From AI-Driven Discovery</h1>
            <p className={styles.subtitle}>
              See how companies uncover hidden AI traffic, improve how AI assistants describe their brand, and
              convert AI discovery into real customer visits.
            </p>
            {successMessage ? <p className={styles.success}>{successMessage}</p> : null}
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {studies.map((study) => (
                <article key={study.slug} className={styles.card}>
                  <div className={styles.metaRow}>
                    <span className={styles.badge}>{study.category}</span>
                    <span className={styles.badge}>{study.industry}</span>
                  </div>
                  <p className={styles.result}>{study.result}</p>
                  <p className={styles.summary}>{study.summary}</p>
                  <button
                    type="button"
                    onClick={() => onDownloadClick(study)}
                    className={styles.downloadButton}
                    disabled={isLoading}
                  >
                    Download Case Study
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Get a Live Walkthrough</h2>
              <p className={styles.ctaText}>
                See how Readable helps your team track AI influence, monitor agent traffic, and improve structured
                content performance.
              </p>
              <a href="https://cal.com/neeraj-jain-eveucp/30min" target="_blank" rel="noreferrer" className={styles.secondaryButton}>
                Book a Demo
              </a>
            </div>
          </div>
        </section>
      </main>

      {isModalOpen && selectedStudy ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="case-study-modal-title" className={styles.modalTitle}>
              Verify your business email
            </h2>
            <p className={styles.modalText}>Get access to {selectedStudy.category} case study in your inbox.</p>

            <form onSubmit={onRequestSubmit}>
              <label htmlFor="case-study-email" className={styles.fieldLabel}>
                Business Email
              </label>
              <input
                id="case-study-email"
                type="email"
                className={`ui-input ${styles.input}`}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
              <p className={styles.helper}>Gmail, Yahoo, Outlook, and other personal domains are not allowed.</p>

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.actions}>
                <button type="submit" className={`ui-btn ui-btn-primary ${styles.primaryButton}`} disabled={isLoading}>
                  {isLoading ? "Downloading..." : "Download Case Study"}
                </button>
                <button type="button" className={`ui-btn ui-btn-secondary ${styles.ghostButton}`} onClick={closeModal} disabled={isLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
