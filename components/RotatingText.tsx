"use client"

import { useEffect, useRef, useState } from "react"
import styles from "../styles/components/RotatingText.module.css"

type RotatingTextProps = {
  words: string[]
  intervalMs?: number
}

export default function RotatingText({ words, intervalMs = 2500 }: RotatingTextProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const intervalRef = setInterval(() => {
      setVisible(false)

      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length)
        setVisible(true)
      }, 340)
    }, intervalMs)

    return () => {
      clearInterval(intervalRef)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [intervalMs, words.length])

  return (
    <span className={styles.wrapper} aria-live="polite" aria-atomic="true">
      <span className={`${styles.word} ${visible ? styles.visible : styles.hidden}`}>{words[index]}</span>
    </span>
  )
}
