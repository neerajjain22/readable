import { FormEvent, useState } from "react"
import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

export default function ContactPage() {
  const [status, setStatus] = useState("")

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "")
    const name = String(formData.get("name") || "")
    const message = String(formData.get("message") || "")

    if (!name.trim() || !message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please complete all fields with a valid email.")
      return
    }

    setStatus("Thanks. Our team will contact you shortly.")
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
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroDescription}>
              Tell us about your goals and we’ll share a practical plan to improve AI visibility and conversion.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.grid2}>
              <form className={styles.card} onSubmit={onSubmit} aria-label="Contact form">
                <h2>Request a demo</h2>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" className={styles.searchInput} required />
                <label htmlFor="email" className={styles.mtSm}>Work Email</label>
                <input id="email" name="email" type="email" className={styles.searchInput} required />
                <label htmlFor="company" className={styles.mtSm}>Company</label>
                <input id="company" name="company" className={styles.searchInput} />
                <label htmlFor="message" className={styles.mtSm}>Message</label>
                <textarea id="message" name="message" className={styles.searchInput} rows={5} required />
                <button className={`${styles.searchButton} ${styles.mtMd}`} type="submit">
                  Send Message
                </button>
                {status ? <p className={styles.text}>{status}</p> : null}
              </form>

              <article className={styles.card}>
                <h2>Company Information</h2>
                <p className={styles.text}>Readable (formerly SonicLinker)</p>
                <p className={styles.text}>501 2nd St, San Francisco, CA 94107</p>
                <p className={styles.text}>Email: hello@readable.ai</p>
                <p className={styles.text}>Support: support@readable.ai</p>
                <ul className={styles.list}>
                  <li>Sales: /contact</li>
                  <li>Docs: /docs</li>
                  <li>Partners: /partners</li>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
