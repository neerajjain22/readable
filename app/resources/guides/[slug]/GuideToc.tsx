"use client"

import { useEffect, useMemo, useState } from "react"
import pageStyles from "./page.module.css"

type TocItem = {
  id: string
  title: string
}

type GuideTocProps = {
  items: TocItem[]
}

export default function GuideToc({ items }: GuideTocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "")

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    if (!itemIds.length) {
      return
    }

    const elements = itemIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (!elements.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleEntries.length > 0) {
          const visibleId = visibleEntries[0].target.getAttribute("id")
          if (visibleId) {
            setActiveId(visibleId)
          }
        }
      },
      {
        rootMargin: "-120px 0px -65% 0px",
        threshold: 0.1,
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => {
      elements.forEach((element) => observer.unobserve(element))
      observer.disconnect()
    }
  }, [itemIds])

  return (
    <aside className={pageStyles.tocWrap} aria-label="Table of contents">
      <p className={pageStyles.tocTitle}>On this page</p>
      <nav className={pageStyles.tocNav}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault()
              const target = document.getElementById(item.id)

              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" })
                window.history.replaceState(null, "", `#${item.id}`)
                setActiveId(item.id)
              }
            }}
            className={`${pageStyles.tocLink} ${activeId === item.id ? pageStyles.tocLinkActive : ""}`}
            aria-current={activeId === item.id ? "true" : undefined}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  )
}
