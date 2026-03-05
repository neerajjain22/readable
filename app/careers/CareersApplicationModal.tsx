"use client"

import { useState } from "react"
import styles from "./page.module.css"

type Props = {
  roleTitle: string
}

type JobApplicationPayload = {
  name: string
  email: string
  linkedin: string
  portfolio: string
  role: string
  intro: string
}

const successMessage =
  "Thanks for your interest in joining Readable. Our team will review your application and reach out if there is a match."

export default function CareersApplicationModal({ roleTitle }: Props) {
  const roleId = roleTitle.toLowerCase().replace(/\s+/g, "-")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState<JobApplicationPayload>({
    name: "",
    email: "",
    linkedin: "",
    portfolio: "",
    role: roleTitle,
    intro: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      linkedin: "",
      portfolio: "",
      role: roleTitle,
      intro: "",
    })
  }

  const openModal = () => {
    setError("")
    setSuccess("")
    setFormData((prev) => ({ ...prev, role: roleTitle }))
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setError("")
    setIsSubmitting(false)
  }

  const onFieldChange = (field: keyof JobApplicationPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/job-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = (await response.json()) as { success?: boolean; error?: string }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to submit application right now. Please try again.")
      }

      setSuccess(successMessage)
      resetForm()
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to submit application right now."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button type="button" className={`ui-btn ui-btn-primary ${styles.applyButton}`} onClick={openModal}>
        Apply
      </button>

      {isOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`role-apply-title-${roleId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id={`role-apply-title-${roleId}`} className={styles.modalTitle}>
              Apply for {roleTitle}
            </h3>

            <form className={styles.modalForm} onSubmit={onSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Full Name</span>
                <input
                  type="text"
                  className={`ui-input ${styles.input}`}
                  value={formData.name}
                  onChange={(event) => onFieldChange("name", event.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Email Address</span>
                <input
                  type="email"
                  className={`ui-input ${styles.input}`}
                  value={formData.email}
                  onChange={(event) => onFieldChange("email", event.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>LinkedIn Profile</span>
                <input
                  type="url"
                  className={`ui-input ${styles.input}`}
                  value={formData.linkedin}
                  onChange={(event) => onFieldChange("linkedin", event.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Portfolio or GitHub (optional)</span>
                <input
                  type="url"
                  className={`ui-input ${styles.input}`}
                  value={formData.portfolio}
                  onChange={(event) => onFieldChange("portfolio", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Role applying for</span>
                <input
                  type="text"
                  className={`ui-input ${styles.input}`}
                  value={formData.role}
                  onChange={(event) => onFieldChange("role", event.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Short introduction</span>
                <textarea
                  className={`ui-textarea ${styles.textarea}`}
                  value={formData.intro}
                  onChange={(event) => onFieldChange("intro", event.target.value)}
                  required
                />
              </label>

              {error ? <p className={styles.error}>{error}</p> : null}
              {success ? <p className={styles.success}>{success}</p> : null}

              <div className={styles.modalActions}>
                <button type="submit" className={`ui-btn ui-btn-primary ${styles.submitButton}`} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Apply Now"}
                </button>
                <button
                  type="button"
                  className={`ui-btn ui-btn-secondary ${styles.ghostButton}`}
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
