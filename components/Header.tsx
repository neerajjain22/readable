import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import styles from "../styles/components/Header.module.css"

const navLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/solutions", label: "Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/partners", label: "Agency Partners" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "Company" },
]

export default function Header() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(`${href}/`)

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.row}>
          <Link href="/" className={styles.logo} aria-label="Readable home">
            Readable
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary">
            <ul className={styles.navList}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link href="/contact" className={styles.ghostButton}>
              Contact
            </Link>
            <Link href="/contact" className={styles.ctaButton}>
              Book a Demo
            </Link>
          </div>

          <button
            type="button"
            className={styles.mobileToggle}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ""}`}>
        <nav className={styles.mobileNav} aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className={styles.ctaButton} onClick={() => setMobileOpen(false)}>
            Book a Demo
          </Link>
        </nav>
      </div>
    </header>
  )
}
