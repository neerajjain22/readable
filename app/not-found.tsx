"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import styles from "../styles/Page.module.css"

const quickLinks = [
  { href: "/", label: "Homepage" },
  { href: "/platform", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

export default function NotFound() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const onSearch = () => {
    const value = query.trim().toLowerCase()
    const match = quickLinks.find((item) => item.label.toLowerCase().includes(value))
    router.push(match ? match.href : "/")
  }

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>We couldn&apos;t find that page</h1>
          <p className={styles.heroDescription}>Try searching for a section or use one of the links below.</p>
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search pages"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search pages"
            />
            <button type="button" className={styles.searchButton} onClick={onSearch}>
              Search
            </button>
          </div>
          <ul className={styles.list}>
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.inlineLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
