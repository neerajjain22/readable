"use client"

import Image from "next/image"
import Link from "next/link"
import { useId, useState } from "react"
import styles from "./ai-question-reveal-widget.module.css"

type AiQuestionRevealWidgetProps = {
  questions?: string[] | string | null
  questionsJson?: string | null
  entityName?: string
}

function parseQuestions(value: unknown) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

function buildChatGptQuestionUrl(question: string) {
  return `https://chatgpt.com/?q=${encodeURIComponent(question)}`
}

export default function AiQuestionRevealWidget({ questions, questionsJson, entityName }: AiQuestionRevealWidgetProps) {
  const [open, setOpen] = useState(false)
  const regionId = useId()
  const parsedQuestionsJson = parseQuestions(questionsJson)
  const normalizedQuestions = parsedQuestionsJson.length > 0 ? parsedQuestionsJson : parseQuestions(questions)

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
      <div className={styles.brandRow}>
        <Image src="/images/readable-icon.png" alt="Readable" width={112} height={24} className={styles.brandLogo} />
        <span className={styles.brandLabs}>Labs</span>
      </div>
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
            <li key={`${question}-${index}`}>
              <a
                href={buildChatGptQuestionUrl(question)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.questionLink}
              >
                {question}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.footer}>
        <p className={styles.source}>Source: Readable Research</p>
        <p className={styles.contactLine}>
          To get Readable Research data, <Link href="/contact">contact us</Link>.
        </p>
      </div>
    </aside>
  )
}
