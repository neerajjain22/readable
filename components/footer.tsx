import * as React from "react"
import styles from "../styles/Footer.module.css"

export default function ReadableFooter() {
    const sections = [
        {
            title: "Platform",
            links: ["AI Visibility", "Agent Analytics", "Agent-Ready Pages"],
        },
        {
            title: "Solutions",
            links: [
                "Increase AI Traffic",
                "Convert AI Agents",
                "Improve AI Positioning",
                "Track AI Revenue",
            ],
        },
        {
            title: "Industries",
            links: ["Ecommerce", "B2B SaaS", "Developer Tools", "Financial Services"],
        },
        {
            title: "Agency Partners",
            links: [
                "Agency Program",
                "Become a Partner",
                "Partner Resources",
                "Co-Sell Opportunities",
            ],
        },
        {
            title: "Resources",
            links: ["Blog", "Research", "Case Studies", "Documentation", "API"],
        },
    ]

    const bottomLinks = ["About", "Careers", "Contact", "Press", "Privacy Policy", "Terms"]

    return (
        <footer aria-label="Site footer" className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.sectionsGrid}>
                    {sections.map((section) => (
                        <nav key={section.title} aria-label={section.title}>
                            <h3 className={styles.sectionTitle}>{section.title}</h3>
                            <ul className={styles.sectionList}>
                                {section.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className={styles.link}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <hr className={styles.separator} />

                <div className={styles.bottom}>
                    <div>
                        <p className={styles.brand}>Readable</p>
                        <p className={styles.tagline}>The AI Visibility &amp; Agent Conversion Platform</p>
                        <p className={styles.copyright}>© 2026 Readable. All rights reserved.</p>
                    </div>

                    <nav aria-label="Company links" className={styles.bottomLinks}>
                        {bottomLinks.map((link) => (
                            <a key={link} href="#" className={styles.link}>
                                {link}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    )
}
