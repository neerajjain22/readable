import styles from "./ProductPreviews.module.css"

export default function AgentOptimizedPagesPreview() {
  return (
    <div className={styles.shell}>
      <div className={styles.stack}>
        <article className={`${styles.panel} ${styles.panelTop}`}>
          <p className={styles.label}>Page Request</p>
          <p className={styles.body}>example.com/running-shoes</p>
          <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
            <p className={styles.subLabel}>Visitor Type Detected</p>
            <div className={styles.visitorGrid}>
              {["Human Visitor", "AI Assistant"].map((label) => (
                <div key={label} className={styles.visitorBadge}>
                  <span className={styles.visitorLabel}>{label}</span>
                  <span className={styles.visitorCheck}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className={`${styles.panel} ${styles.panelBottom}`}>
          <p className={styles.label}>Dual Content Delivery</p>
          <div className={styles.dualGrid}>
            <div className={styles.experienceCard}>
              <p className={styles.subLabel}>Human Experience</p>
              <div className={styles.humanBlock}>
                <div className={styles.heroBlock} />
                <div className={styles.line90} />
                <div className={styles.line74} />
                <div className={styles.twoCol}>
                  <div className={styles.ghostBtn} />
                  <div className={styles.buyBtn}>Buy</div>
                </div>
              </div>
            </div>

            <div className={styles.experienceCard}>
              <p className={styles.subLabel}>AI Agent Experience</p>
              <div className={styles.aiBlock}>
                <div className={styles.chip}>Product summary</div>
                <div className={styles.chip}>Key attributes</div>
                <div className={styles.chip}>Specifications</div>
                <div className={styles.chip}>Comparison points</div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
