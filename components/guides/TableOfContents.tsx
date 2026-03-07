"use client"

import type { MouseEvent } from "react"
import { headingToAnchor } from "../../lib/internalLinks"
import styles from "./table-of-contents.module.css"

type TableOfContentsProps = {
  headings: string[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null
  }

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, heading: string) => {
    event.preventDefault()
    const id = headingToAnchor(heading)
    const target = document.getElementById(id)

    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", `#${id}`)
  }

  return (
    <nav className={styles.wrapper} aria-label="Table of contents">
      <h2 className={styles.title}>On this page</h2>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li key={heading}>
            <a
              className={styles.link}
              href={`#${headingToAnchor(heading)}`}
              onClick={(event) => scrollToSection(event, heading)}
            >
              {heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
