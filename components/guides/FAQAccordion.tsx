"use client"

import { useState } from "react"
import styles from "./faq-accordion.module.css"

type FAQItem = {
  question: string
  answer: string
}

type FAQAccordionProps = {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div key={item.question} className={styles.item}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
            >
              Q: {item.question}
            </button>
            <div
              id={`faq-panel-${index}`}
              className={`${styles.answerWrap} ${isOpen ? styles.answerWrapOpen : ""}`.trim()}
            >
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
