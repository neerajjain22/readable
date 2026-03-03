import styles from "../styles/Hero.module.css"

const cn = (...classNames: Array<string | undefined | false>) => classNames.filter(Boolean).join(" ")

export default function HeroSection() {
    return (
        <section className={styles.section} aria-labelledby="hero-title">
            <div className={styles.container}>
                <div className={styles.hero}>
                    <h1 id="hero-title" className={styles.heading}>
                        Understand How AI Sees Your Brand.
                    </h1>
                    <p className={styles.subheading}>
                        Readable helps you monitor how LLMs represent you, track AI-driven traffic, and
                        structure your site for AI agents.
                    </p>

                    <div className={styles.ctaWrap}>
                        <button className={cn(styles.button, styles.buttonPrimary)} type="button">
                            Book a Demo
                        </button>
                    </div>

                    <div className={styles.leadMagnet} aria-label="Website analysis form">
                        <div className={styles.leadRow}>
                            <input
                                type="url"
                                placeholder="Enter your website URL"
                                aria-label="Website URL"
                                className={styles.input}
                            />
                            <button className={cn(styles.button, styles.buttonSecondary)} type="button">
                                Analyze My Site
                            </button>
                        </div>
                        <small className={styles.helperText}>
                            Instant high-level analysis. Full breakdown available in demo.
                        </small>
                    </div>
                </div>
            </div>
        </section>
    )
}
