"use client"

import type { MouseEvent } from "react"
import { headingToAnchor, stripMarkdownLinks } from "../../lib/internalLinks"
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
    const cleanHeading = stripMarkdownLinks(heading)
    const id = headingToAnchor(cleanHeading)
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
          (() => {
            const cleanHeading = stripMarkdownLinks(heading)
            const anchor = headingToAnchor(cleanHeading)
            return (
          <li key={heading}>
            <a
              className={styles.link}
              href={`#${anchor}`}
              onClick={(event) => scrollToSection(event, heading)}
            >
              {cleanHeading}
            </a>
          </li>
            )
          })()
        ))}
      </ul>
    </nav>
  )
}
