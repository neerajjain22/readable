import Link from "next/link"
import styles from "../styles/components/Breadcrumbs.module.css"

export type Crumb = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: Crumb[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={styles.current}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span className={styles.sep}>/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
