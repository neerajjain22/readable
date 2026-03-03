import * as React from "react"
import styles from "../styles/Header.module.css"

type NavGroup = {
    label: string
    items: string[]
}

type NavLink = {
    label: string
}

type NavItem = NavGroup | NavLink

const hasItems = (item: NavItem): item is NavGroup => "items" in item

const navItems: NavItem[] = [
    {
        label: "Platform",
        items: ["AI Visibility", "Agent Analytics", "Agent-Ready Pages"],
    },
    {
        label: "Solutions",
        items: [
            "Increase AI Traffic",
            "Convert AI Agents",
            "Improve AI Positioning",
            "Track AI Revenue",
        ],
    },
    {
        label: "Industries",
        items: ["Ecommerce", "B2B SaaS", "Developer Tools", "Financial Services"],
    },
    { label: "Agency Partners" },
    { label: "Pricing" },
    {
        label: "Resources",
        items: ["Blog", "Research", "Case Studies", "Documentation"],
    },
    {
        label: "Company",
        items: ["About", "Careers", "Contact", "Press"],
    },
]

const DESKTOP_BREAKPOINT = 980
const cn = (...classNames: Array<string | undefined | false>) => classNames.filter(Boolean).join(" ")

export default function ReadableHeader() {
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [mobileExpanded, setMobileExpanded] = React.useState<Record<string, boolean>>({})
    const [openDesktopDropdown, setOpenDesktopDropdown] = React.useState<string | null>(null)

    React.useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > DESKTOP_BREAKPOINT && mobileOpen) {
                setMobileOpen(false)
            }
        }

        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [mobileOpen])

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMobileOpen(false)
                setOpenDesktopDropdown(null)
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const toggleMobileSection = (label: string) => {
        setMobileExpanded((prev) => ({
            ...prev,
            [label]: !prev[label],
        }))
    }

    return (
        <header className={styles.header} role="banner">
            <div className={styles.container}>
                <div className={styles.row}>
                    <a className={styles.logo} href="#" aria-label="Readable Home">
                        Readable
                    </a>

                    <nav className={styles.desktopNav} aria-label="Main navigation">
                        <ul className={styles.navList}>
                            {navItems.map((item) => {
                                if (!hasItems(item)) {
                                    return (
                                        <li key={item.label} className={styles.navItem}>
                                            <a className={styles.navLink} href="#">
                                                {item.label}
                                            </a>
                                        </li>
                                    )
                                }

                                const isOpen = openDesktopDropdown === item.label
                                const menuId = `menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`

                                return (
                                    <li
                                        key={item.label}
                                        className={styles.navItem}
                                        onMouseEnter={() => setOpenDesktopDropdown(item.label)}
                                        onMouseLeave={() => setOpenDesktopDropdown(null)}
                                    >
                                        <button
                                            type="button"
                                            className={cn(styles.navLink, styles.navButton)}
                                            aria-expanded={isOpen}
                                            aria-haspopup="menu"
                                            aria-controls={menuId}
                                            onFocus={() => setOpenDesktopDropdown(item.label)}
                                            onClick={() =>
                                                setOpenDesktopDropdown((prev) =>
                                                    prev === item.label ? null : item.label
                                                )
                                            }
                                        >
                                            {item.label}
                                            <span className={styles.caret} aria-hidden="true">
                                                ▾
                                            </span>
                                        </button>
                                        <div
                                            id={menuId}
                                            role="menu"
                                            className={cn(styles.dropdownPanel, isOpen && styles.dropdownPanelOpen)}
                                        >
                                            {item.items.map((option) => (
                                                <a
                                                    key={option}
                                                    href="#"
                                                    role="menuitem"
                                                    className={styles.dropdownLink}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Escape") {
                                                            setOpenDesktopDropdown(null)
                                                        }
                                                    }}
                                                >
                                                    {option}
                                                </a>
                                            ))}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    <div className={styles.desktopActions}>
                        <a className={styles.ctaButton} href="#">
                            Book a Demo
                        </a>
                    </div>

                    <button
                        type="button"
                        className={styles.mobileToggle}
                        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-nav"
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>

            <div
                id="mobile-nav"
                className={cn(styles.mobilePanel, mobileOpen && styles.mobilePanelOpen)}
                aria-hidden={!mobileOpen}
            >
                <nav className={styles.mobileNav} aria-label="Mobile navigation">
                    <ul className={styles.mobileList}>
                        {navItems.map((item) => {
                            if (!hasItems(item)) {
                                return (
                                    <li key={item.label} className={styles.mobileItem}>
                                        <a className={styles.mobileLink} href="#">
                                            {item.label}
                                        </a>
                                    </li>
                                )
                            }

                            const expanded = !!mobileExpanded[item.label]
                            const sectionId = `mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`

                            return (
                                <li key={item.label} className={styles.mobileItem}>
                                    <button
                                        type="button"
                                        className={styles.mobileLink}
                                        aria-expanded={expanded}
                                        aria-controls={sectionId}
                                        onClick={() => toggleMobileSection(item.label)}
                                    >
                                        {item.label}
                                        <span className={cn(styles.caret, expanded && styles.caretOpen)}>▾</span>
                                    </button>
                                    <div
                                        id={sectionId}
                                        className={cn(styles.mobileSubmenu, expanded && styles.mobileSubmenuOpen)}
                                    >
                                        {item.items.map((option) => (
                                            <a key={option} className={styles.mobileSubLink} href="#">
                                                {option}
                                            </a>
                                        ))}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    <a className={cn(styles.ctaButton, styles.mobileCta)} href="#">
                        Book a Demo
                    </a>
                </nav>
            </div>
        </header>
    )
}
