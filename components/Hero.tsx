import Image from "next/image"
import Link from "next/link"
import styles from "../styles/components/Hero.module.css"

export default function Hero() {
  return (
    <section className={styles.section} aria-labelledby="home-hero-title">
      <div className={styles.container}>
        <div className={styles.layout}>
          <div>
            <p className={styles.kicker}>AI Influence & Agent Analytics</p>
            <h1 id="home-hero-title" className={styles.title}>
              Understand How AI Recommends Your Brand
            </h1>
            <p className={styles.subtitle}>
              Readable helps growth teams track model positioning, measure AI-agent traffic, and ship
              agent-ready pages that convert.
            </p>
            <div className={styles.actions}>
              <Link href="/book-demo" className="btn btn-primary">
                Book a Demo
              </Link>
              <Link href="/platform" className="btn btn-secondary">
                Explore Platform
              </Link>
            </div>
          </div>
          <div className={`ui-visual-shell ${styles.visual}`}>
            <Image
              src="/images/hero-dashboard.svg"
              alt="Readable dashboard preview"
              width={560}
              height={360}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
