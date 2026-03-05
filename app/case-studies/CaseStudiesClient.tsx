"use client"

import { useEffect, useMemo, useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/footer"
import styles from "./case-studies.module.css"

type CaseStudy = {
  slug: string
  category: string
  industry: string
  result: string
  summary: string
  file: string
}

type ModalStep = "email" | "otp" | "success"

const VERIFIED_EMAIL_STORAGE_KEY = "readable_verified_case_study_email"

export default function CaseStudiesClient({ studies }: { studies: CaseStudy[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState<ModalStep>("email")
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
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

  const hasStoredEmail = useMemo(() => Boolean(email), [email])

  const resetModal = () => {
    setStep("email")
    setOtp("")
    setError("")
    setSuccessMessage("")
    setIsLoading(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStudy(null)
    resetModal()
  }

  const openModalForStudy = (study: CaseStudy) => {
    setSelectedStudy(study)
    setIsModalOpen(true)
    setError("")
    setSuccessMessage("")

    if (hasStoredEmail) {
      setStep("email")
    }
  }

  const requestCaseStudy = async (targetSlug: string, targetEmail: string) => {
    const response = await fetch("/api/request-case-study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: targetEmail,
        slug: targetSlug,
      }),
    })

    const payload = (await response.json()) as { status?: string; error?: string }

    if (!response.ok) {
      throw new Error(payload.error || "Failed to process your request.")
    }

    return payload
  }

  const onDownloadClick = async (study: CaseStudy) => {
    if (!hasStoredEmail) {
      openModalForStudy(study)
      return
    }

    try {
      setIsLoading(true)
      setError("")
      const payload = await requestCaseStudy(study.slug, email)

      if (payload.status === "sent") {
        setSuccessMessage("Case study sent to your verified email.")
        return
      }

      openModalForStudy(study)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to request case study."
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
      const payload = await requestCaseStudy(selectedStudy.slug, email)

      if (payload.status === "sent") {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(VERIFIED_EMAIL_STORAGE_KEY, email)
        }
        setStep("success")
        setSuccessMessage("Case study has been sent to your inbox.")
        return
      }

      if (payload.status === "otp_sent") {
        setStep("otp")
        setSuccessMessage("We sent a 6-digit OTP to your email. Enter it below.")
        return
      }

      setError("Unexpected response. Please try again.")
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to request case study."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedStudy) {
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          slug: selectedStudy.slug,
        }),
      })

      const payload = (await response.json()) as { status?: string; error?: string }

      if (!response.ok) {
        throw new Error(payload.error || "Verification failed.")
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(VERIFIED_EMAIL_STORAGE_KEY, email)
      }

      setStep("success")
      setSuccessMessage("Email verified. Your case study is on its way.")
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : "Failed to verify OTP."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
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
      <Footer />

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

            {step === "email" ? (
              <form onSubmit={onRequestSubmit}>
                <label htmlFor="case-study-email" className={styles.fieldLabel}>
                  Business Email
                </label>
                <input
                  id="case-study-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
                <p className={styles.helper}>Gmail, Yahoo, Outlook, and other personal domains are not allowed.</p>

                {error ? <p className={styles.error}>{error}</p> : null}
                {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryButton} disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                  <button type="button" className={styles.ghostButton} onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {step === "otp" ? (
              <form onSubmit={onVerifySubmit}>
                <label htmlFor="case-study-otp" className={styles.fieldLabel}>
                  Enter OTP
                </label>
                <input
                  id="case-study-otp"
                  type="text"
                  className={styles.input}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  required
                />

                {error ? <p className={styles.error}>{error}</p> : null}
                {successMessage ? <p className={styles.success}>{successMessage}</p> : null}

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryButton} disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Send Case Study"}
                  </button>
                  <button type="button" className={styles.ghostButton} onClick={closeModal}>
                    Close
                  </button>
                </div>
              </form>
            ) : null}

            {step === "success" ? (
              <div>
                <p className={styles.success}>{successMessage}</p>
                <div className={styles.actions}>
                  <button type="button" className={styles.primaryButton} onClick={closeModal}>
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
