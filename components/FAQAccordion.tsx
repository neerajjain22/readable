"use client"

import { useMemo, useState } from "react"
import { FAQItem } from "../data/faqs"
import Accordion from "./Accordion"
import styles from "../styles/components/FAQAccordion.module.css"

type FAQAccordionProps = {
  items: FAQItem[]
  showSearch?: boolean
}

export default function FAQAccordion({ items, showSearch = false }: FAQAccordionProps) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  )

  return (
    <div className={styles.wrapper}>
      {showSearch ? (
        <div className={styles.searchWrap}>
          <label htmlFor="faq-search" className={styles.label}>
            Search FAQs
          </label>
          <input
            id="faq-search"
            className={styles.search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by keyword"
          />
        </div>
      ) : null}
      <Accordion items={filtered.map((item) => ({ title: item.question, content: item.answer }))} />
    </div>
  )
}
