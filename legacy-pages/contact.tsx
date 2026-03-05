"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/contact.module.css"

export default function ContactPage() {
  const [status, setStatus] = useState("")

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "")
    const name = String(formData.get("name") || "")
    const company = String(formData.get("company") || "")
    const message = String(formData.get("message") || "")

    if (!name.trim() || !message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please complete all fields with a valid email.")
      return
    }

    const subject = encodeURIComponent(`Contact Request from ${name.trim()}`)
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nWork Email: ${email.trim()}\nCompany: ${company.trim() || "Not provided"}\n\nMessage:\n${message.trim()}`,
    )
    window.location.href = `mailto:hello@tryreadable.ai?subject=${subject}&body=${body}`
    setStatus("Your email app should open now. If it doesn’t, email hello@tryreadable.ai.")
    event.currentTarget.reset()
  }

  return (
    <Layout>
      <Seo
        title="Contact Readable"
        description="Contact Readable sales and support teams for demos, onboarding, and partnership inquiries."
        path="/contact"
      />
      <main className={styles.page}>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
            <h1 className={styles.heading}>Contact Us</h1>
            <p className={styles.subheading}>
              Reach out for questions, partnerships, or support. Our team typically responds within one
              business day.
            </p>
            <p className={styles.reassurance}>Prefer a live walkthrough? Book a demo to see how Readable works.</p>
            <div className={styles.heroActions}>
              <Link href="/book-demo" className={styles.primaryButton}>
                Book a Demo
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              <article className={styles.card}>
                <h2 className={styles.cardTitle}>Email Us</h2>
                <p className={styles.text}>For sales questions, partnerships, or product support.</p>
                <p className={styles.emailRow}>
                  <a href="mailto:hello@tryreadable.ai" className={styles.inlineLink}>
                    hello@tryreadable.ai
                  </a>
                </p>
                <p className={styles.helper}>We typically respond within one business day.</p>
              </article>

              <article className={styles.card}>
                <h2 className={styles.cardTitle}>Our Offices</h2>
                <div className={styles.locationRow}>
                  <span className={styles.locationIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M12 22s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <div>
                    <p className={styles.officeTitle}>USA</p>
                    <p className={styles.text}>380 Brannan St</p>
                    <p className={styles.text}>San Francisco, CA 94107</p>
                  </div>
                </div>
                <div className={styles.locationRow}>
                  <span className={styles.locationIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M12 22s7-6.6 7-12a7 7 0 1 0-14 0c0 5.4 7 12 7 12z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <div>
                    <p className={styles.officeTitle}>India</p>
                    <p className={styles.text}>1781, HSR Layout</p>
                    <p className={styles.text}>Bengaluru</p>
                    <p className={styles.text}>Karnataka</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.centerShell}>
              <h2 className={styles.sectionTitle}>Have Questions? Talk to Us.</h2>
              <p className={styles.centerText}>
                Schedule a quick call to discuss your use case and see how AI systems influence discovery
                for your brand.
              </p>
              <div className={styles.centerActions}>
                <a
                  href="https://cal.com/neeraj-jain-eveucp/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                >
                  Schedule a Call
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <form className={styles.card} onSubmit={onSubmit} aria-label="Contact form">
              <h2 className={styles.cardTitle}>Send Us a Message</h2>
              <div className={styles.formGrid}>
                <div>
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" className={styles.input} required />
                </div>
                <div>
                  <label htmlFor="email">Work Email</label>
                  <input id="email" name="email" type="email" className={styles.input} required />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="company">Company (optional)</label>
                <input id="company" name="company" className={styles.input} />
              </div>
              <div className={styles.field}>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" className={styles.input} rows={5} required />
              </div>
              <button className={styles.primaryButton} type="submit">
                Send Message
              </button>
              {status ? <p className={styles.status}>{status}</p> : null}
            </form>
          </div>
        </section>
      </main>
    </Layout>
  )
}
