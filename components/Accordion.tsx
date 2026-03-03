import { useState } from "react"
import styles from "../styles/components/Accordion.module.css"

export type AccordionItem = {
  title: string
  content: string
}

type AccordionProps = {
  items: AccordionItem[]
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className={styles.list}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <section key={item.title} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                className={styles.trigger}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${index}`}
                id={`acc-trigger-${index}`}
                type="button"
              >
                <span>{item.title}</span>
                <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}>+</span>
              </button>
            </h3>
            <div
              id={`acc-panel-${index}`}
              role="region"
              aria-labelledby={`acc-trigger-${index}`}
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
            >
              <p className={styles.content}>{item.content}</p>
            </div>
          </section>
        )
      })}
    </div>
  )
}
