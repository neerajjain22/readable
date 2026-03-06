"use client"

import { useState } from "react"
import styles from "./page.module.css"

type RequestPayload = {
  name: string
  email: string
  company: string
  website: string
  use_case: string
  details: string
}

const USE_CASE_OPTIONS = [
  { value: "product_integration", label: "Product integration" },
  { value: "internal_analytics", label: "Internal analytics" },
  { value: "agency_reporting", label: "Agency reporting" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
]

const initialForm: RequestPayload = {
  name: "",
  email: "",
  company: "",
  website: "",
  use_case: "",
  details: "",
}

export default function ApiAccessRequestForm() {
  const [formData, setFormData] = useState<RequestPayload>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const onChange = (field: keyof RequestPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/api-access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = (await response.json()) as { success?: boolean; error?: string }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to submit request right now. Please try again.")
      }

      setSuccess("Thanks for your request. Our team will review your use case and share API documentation shortly.")
      setFormData(initialForm)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to submit request right now."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.formCard} onSubmit={onSubmit}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Full Name</span>
          <input
            className={`ui-input ${styles.input}`}
            type="text"
            value={formData.name}
            onChange={(event) => onChange("name", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Business Email</span>
          <input
            className={`ui-input ${styles.input}`}
            type="email"
            value={formData.email}
            onChange={(event) => onChange("email", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Company</span>
          <input
            className={`ui-input ${styles.input}`}
            type="text"
            value={formData.company}
            onChange={(event) => onChange("company", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Company Website</span>
          <input
            className={`ui-input ${styles.input}`}
            type="url"
            value={formData.website}
            onChange={(event) => onChange("website", event.target.value)}
            placeholder="https://example.com"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Use Case</span>
          <select
            className={`ui-select ${styles.select}`}
            value={formData.use_case}
            onChange={(event) => onChange("use_case", event.target.value)}
            required
          >
            <option value="" disabled>
              Select a use case
            </option>
            {USE_CASE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Integration Details</span>
        <textarea
          className={`ui-textarea ${styles.textarea}`}
          value={formData.details}
          onChange={(event) => onChange("details", event.target.value)}
          placeholder="Describe what you want to build using the Readable API."
          required
        />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <button type="submit" className={`btn btn-primary ${styles.submitButton}`} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Request API Access"}
      </button>
    </form>
  )
}
