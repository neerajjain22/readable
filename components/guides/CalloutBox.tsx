import styles from "./callout-box.module.css"

type CalloutType = "insight" | "tip" | "important"

type CalloutBoxProps = {
  type?: CalloutType
  text: string
}

const titleByType: Record<CalloutType, string> = {
  insight: "Key Insight",
  tip: "Tip",
  important: "Important",
}

export default function CalloutBox({ type = "insight", text }: CalloutBoxProps) {
  if (!text.trim()) {
    return null
  }

  const toneClass = type === "tip" ? styles.tip : type === "important" ? styles.important : ""

  return (
    <aside className={`${styles.box} ${toneClass}`.trim()}>
      <p className={styles.title}>{titleByType[type]}</p>
      <p className={styles.content}>{text}</p>
    </aside>
  )
}
