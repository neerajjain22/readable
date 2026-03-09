import styles from "./programmatic.module.css"

type ProgrammaticLayoutProps = {
  title: string
  author: string
  lastUpdated: string
  kicker?: string
  children: React.ReactNode
}

export default function ProgrammaticLayout({ title, author, lastUpdated, kicker, children }: ProgrammaticLayoutProps) {
  return (
    <main className={styles.page}>
      <p className={styles.kicker}>{kicker ?? "Programmatic Guide"}</p>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.metaRow}>
        <span className={styles.metaItem}>Last updated: {lastUpdated}</span>
        <span className={styles.metaItem}>Author: {author}</span>
      </div>
      <section className={styles.article}>{children}</section>
    </main>
  )
}
