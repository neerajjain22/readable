import styles from "./programmatic.module.css"
import type { ProgrammaticAuthorPair } from "../../lib/programmatic/authors"

type ProgrammaticLayoutProps = {
  title: string
  author: string
  lastUpdated: string
  kicker?: string
  authorProfiles?: ProgrammaticAuthorPair
  children: React.ReactNode
}

export default function ProgrammaticLayout({
  title,
  author,
  lastUpdated,
  kicker,
  authorProfiles,
  children,
}: ProgrammaticLayoutProps) {
  const authorMeta = authorProfiles
    ? `${authorProfiles.mainAuthor.name} (Main), ${authorProfiles.coAuthor.name} (Co-author)`
    : author

  return (
    <main className={styles.page}>
      <p className={styles.kicker}>{kicker ?? "Programmatic Guide"}</p>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.metaRow}>
        <span className={styles.metaItem}>Last updated: {lastUpdated}</span>
        <span className={styles.metaItem}>Author: {authorMeta}</span>
      </div>
      {authorProfiles ? (
        <section className={styles.authorBlock} aria-label="Guide authors">
          <h2 className={styles.authorBlockTitle}>About the authors</h2>
          <div className={styles.authorGrid}>
            <article className={styles.authorCard}>
              <p className={styles.authorRole}>Main author</p>
              <p className={styles.authorName}>{authorProfiles.mainAuthor.name}</p>
              <p className={styles.authorBio}>{authorProfiles.mainAuthor.bio}</p>
              <a
                className={styles.authorLink}
                href={authorProfiles.mainAuthor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn profile
              </a>
            </article>
            <article className={styles.authorCard}>
              <p className={styles.authorRole}>Co-author</p>
              <p className={styles.authorName}>{authorProfiles.coAuthor.name}</p>
              <p className={styles.authorBio}>{authorProfiles.coAuthor.bio}</p>
              <a
                className={styles.authorLink}
                href={authorProfiles.coAuthor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn profile
              </a>
            </article>
          </div>
        </section>
      ) : null}
      <section className={styles.article}>{children}</section>
    </main>
  )
}
