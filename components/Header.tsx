"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "../styles/components/Header.module.css"

type NavLink = {
  href: string
  label: string
  items?: Array<{ href: string; label: string }>
}

const navLinks: NavLink[] = [
  {
    href: "/platform",
    label: "Platform",
    items: [
      { href: "/platform/ai-visibility", label: "AI Influence" },
      { href: "/platform/agent-analytics", label: "Agent Analytics" },
      { href: "/platform/agent-ready-pages", label: "Agent-Ready Pages" },
    ],
  },
  {
    href: "/solutions",
    label: "Solutions",
    items: [
      { href: "/solutions/growth-teams", label: "Growth Teams" },
      { href: "/solutions/brand-teams", label: "Brand Teams" },
      { href: "/solutions/product-teams", label: "Product Teams" },
      { href: "/solutions/analytics-teams", label: "Analytics Teams" },
    ],
  },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/agency-partners", label: "Agency Partners" },
  { href: "/pricing", label: "Pricing" },
  {
    href: "/resources",
    label: "Resources",
    items: [
      { href: "/blog", label: "Blog" },
      { href: "/docs", label: "API Docs" },
      { href: "/whitepapers", label: "Whitepapers" },
    ],
  },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const hasDropdown = (link: NavLink) => !!link.items && link.items.length > 0

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.row}>
          <Link href="/" className={styles.logo} aria-label="Readable home">
            Readable
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary">
            <ul className={styles.navList}>
              {navLinks.map((link) => {
                const isOpen = openDropdown === link.label

                if (!hasDropdown(link)) {
                  return (
                    <li key={link.href} className={styles.navItem}>
                      <Link
                        href={link.href}
                        className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li
                    key={link.href}
                    className={styles.navItem}
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    onFocus={() => setOpenDropdown(link.label)}
                  >
                    <Link
                      href={link.href}
                      className={`${styles.navLink} ${styles.navButton} ${isActive(link.href) ? styles.navLinkActive : ""}`}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                    >
                      {link.label}
                      <span className={styles.caret} aria-hidden="true">
                        ▾
                      </span>
                    </Link>

                    <div className={`${styles.dropdownPanel} ${isOpen ? styles.dropdownPanelOpen : ""}`} role="menu">
                      {link.items?.map((item) => (
                        <Link key={item.href + item.label} href={item.href} className={styles.dropdownLink} role="menuitem">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link href="/contact" className={styles.ghostButton}>
              Contact
            </Link>
            <Link href="/book-demo" className={styles.ctaButton}>
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
          <Link href="/book-demo" className={styles.ctaButton} onClick={() => setMobileOpen(false)}>
            Book a Demo
          </Link>
        </nav>
      </div>
    </header>
  )
}
