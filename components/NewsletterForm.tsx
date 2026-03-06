"use client"

import { FormEvent, useState } from "react"
import styles from "../styles/components/NewsletterForm.module.css"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setMessage(isValid ? "Thanks. You are subscribed." : "Enter a valid work email.")
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-label="Newsletter form">
      <label htmlFor="newsletter-email" className={styles.label}>
        Get product updates
      </label>
      <div className={styles.row}>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={styles.input}
          placeholder="you@company.com"
          required
        />
        <button type="submit" className={`btn btn-primary ${styles.button}`}>
          Subscribe
        </button>
      </div>
      {message ? <p className={styles.message}>{message}</p> : null}
    </form>
  )
}
