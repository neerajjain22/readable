import Link from "next/link"
import styles from "./callout-box.module.css"

type CalloutType = "insight" | "tip" | "important"
type CalloutCta = "analyze" | "demo"

type LegacyCalloutBoxProps = {
  type?: CalloutType
  text: string
  summary?: never
  cta?: never
}

type StaticCalloutBoxProps = {
  summary: string
  cta: CalloutCta
  type?: never
  text?: never
}

const titleByType: Record<CalloutType, string> = {
  insight: "Key Insight",
  tip: "Tip",
  important: "Important",
}

type CalloutBoxProps = LegacyCalloutBoxProps | StaticCalloutBoxProps

export default function CalloutBox(props: CalloutBoxProps) {
  const summary = "summary" in props ? props.summary : undefined

  if (!summary?.trim()) {
    return null
  }

  const ctaHref =
    props.cta === "analyze"
      ? "https://agents.soniclinker.com/view-report/?domain="
      : "/book-demo"

  const ctaLabel = props.cta === "analyze" ? "Analyze Your Website" : "Book a Demo"

  return (
    <aside className={styles.box}>
      <p className={styles.title}>{titleByType.insight}</p>
      <p className={styles.content}>{summary}</p>
      <Link href={ctaHref} className={styles.button}>
        {ctaLabel}
      </Link>
    </aside>
  )
}
