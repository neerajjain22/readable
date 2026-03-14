"use client"

import { useId, useState } from "react"
import styles from "./ai-question-reveal-widget.module.css"

type AiQuestionRevealWidgetProps = {
  questions?: string[] | string | null
  entityName?: string
}

export default function AiQuestionRevealWidget({ questions, entityName }: AiQuestionRevealWidgetProps) {
  const [open, setOpen] = useState(false)
  const regionId = useId()
  const normalizedQuestions = (() => {
    if (Array.isArray(questions)) {
      return questions
    }

    if (typeof questions === "string") {
      try {
        const parsed = JSON.parse(questions) as unknown
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    return []
  })()

  const cleanQuestions = normalizedQuestions.filter(
    (question): question is string => typeof question === "string" && question.trim().length > 0,
  )

  if (cleanQuestions.length === 0) {
    return null
  }

  const heading = entityName?.trim()
    ? `Top questions buyers ask AI about ${entityName.trim()}`
    : "Top questions buyers ask AI"

  return (
    <aside className={styles.box}>
      <p className={styles.title}>{heading}</p>
      <button
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Hide questions" : "Reveal questions"}
      </button>
      <div id={regionId} className={styles.content} hidden={!open}>
        <ol className={styles.list}>
          {cleanQuestions.map((question, index) => (
            <li key={`${question}-${index}`}>{question}</li>
          ))}
        </ol>
      </div>
    </aside>
  )
}
