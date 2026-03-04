import styles from "./ProductPreviews.module.css"

const attributes = [
  { attribute: "Comfort", width: "78%" },
  { attribute: "Performance", width: "54%" },
  { attribute: "Durability", width: "60%" },
  { attribute: "Price", width: "44%" },
  { attribute: "Beginner-friendly", width: "82%" },
]

export default function AIInfluencePreview() {
  return (
    <div className={styles.shell}>
      <div className={`${styles.stack} ${styles.stackCompact}`}>
        <article className={`${styles.panel} ${styles.panelTop}`}>
          <p className={styles.label}>Brand Influence by Attribute</p>
          <div className={styles.grid} style={{ marginTop: "8px" }}>
            {attributes.map((item) => (
              <div key={item.attribute} className={styles.attributeItem}>
                <p className={styles.metricText} style={{ margin: 0, lineHeight: 1.35 }}>
                  {item.attribute}
                </p>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
          <p className={styles.helper}>Brand strength shown as association intensity across AI responses.</p>
        </article>

        <article className={`${styles.panel} ${styles.panelBottom}`}>
          <p className={styles.label}>Opportunity</p>
          <p className={styles.body} style={{ fontSize: "11px", lineHeight: 1.5 }}>
            BrandX underrepresented in performance-related recommendations.
          </p>
        </article>
      </div>
    </div>
  )
}
