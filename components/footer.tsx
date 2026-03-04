import Link from "next/link"
import styles from "../styles/components/Footer.module.css"

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/platform", label: "AI Influence" },
      { href: "/platform", label: "Agent Analytics" },
      { href: "/platform", label: "Agent-Ready Pages" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions/growth-teams", label: "Growth Teams" },
      { href: "/solutions/brand-teams", label: "Brand Teams" },
      { href: "/solutions/product-teams", label: "Product Teams" },
      { href: "/solutions/analytics-teams", label: "Analytics Teams" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/docs", label: "Docs" },
      { href: "/resources", label: "Whitepapers" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/partners", label: "Agency Partners" },
      { href: "/contact", label: "Contact" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.container}>
        <div className={styles.grid}>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className={styles.title}>{col.title}</h3>
              <ul className={styles.list}>
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <div>
            <p className={styles.brand}>Readable</p>
            <p className={styles.text}>The AI Influence & Agent Analytics Platform</p>
          </div>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.link}>
              Privacy
            </Link>
            <Link href="/terms" className={styles.link}>
              Terms
            </Link>
            <Link href="/faq" className={styles.link}>
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
