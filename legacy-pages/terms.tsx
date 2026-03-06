import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

export default function TermsPage() {
  return (
    <Layout>
      <Seo
        title="Terms of Service | Readable"
        description="Readable terms of service governing use of the platform, billing, and acceptable use."
        path="/terms"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms" }]} />
            <h1 className={styles.heroTitle}>Terms of Service</h1>
            <p className={styles.heroDescription}>Effective Date: April 18, 2025</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <article className={styles.container}>
            <p className={styles.text}>
              Welcome to SonicLinker, Inc. ("Company", "we", "our", "us"). By accessing or using our website and
              services, you agree to comply with and be bound by the following terms and conditions ("Terms").
              Please read these carefully before using our services. If you do not agree to these Terms, please do
              not use our services.
            </p>

            <h2 className={styles.mtMd}>General Terms</h2>
            <p className={styles.text}>
              Please read these Terms and Conditions (hereinafter referred to as "Terms", "Terms of Use", or
              "Terms of Service") carefully. Your use of this website or mobile application constitutes your
              agreement to be bound by these Terms.
            </p>
            <p className={styles.text}>
              When you access, browse, or use this website, you may access any sub-site linked through this
              website. Such sub-sites may have their own terms and conditions of use, and you are obliged to
              follow the terms according to the instructions set out in such sub-sites.
            </p>

            <h2 className={styles.mtMd}>User ID and Password</h2>
            <p className={styles.text}>
              By entering into this Agreement, you acknowledge and agree that your user ID and password
              ("Participant Account") is for your exclusive use only. Use or sharing of your Participant Account
              with another user is not permitted and is cause for immediate blocking of your access to the
              website, the services, the content, and the courseware, and for termination of this Agreement.
            </p>

            <h2 className={styles.mtMd}>Usage of the Website and Services</h2>
            <p className={styles.text}>
              We grant you a personal, restricted, non-transferable, non-exclusive, and revocable license to use
              the website, services, content, and courseware offered through the website until completion of the
              certification training course that you have enrolled for, or termination of this Agreement according
              to these Terms, whichever is earlier.
            </p>

            <h2 className={styles.mtMd}>Intellectual Property Rights</h2>
            <p className={styles.text}>
              While you are granted a limited and non-exclusive right to use the website, services, content, and
              courseware for the restricted purpose set forth in this Agreement, you acknowledge and agree that we
              are the sole and exclusive owner of the website, services, content, and courseware and are vested
              with all intellectual property rights and other proprietary rights in them.
            </p>

            <h2 className={styles.mtMd}>Contact Information</h2>
            <p className={styles.text}>
              If you have any questions or concerns about these Terms, please contact us at:
            </p>
            <ul className={styles.list}>
              <li>SONICLINKER, INC</li>
              <li>380 Brannan St, San Francisco, CA 94107</li>
              <li>
                Email:{" "}
                <a className={styles.inlineLink} href="mailto:info@soniclinker.com">
                  info@soniclinker.com
                </a>
              </li>
            </ul>
            <p className={`${styles.text} ${styles.mtMd}`}>
              By continuing to access or use our services, you acknowledge that you have read, understood, and
              agreed to these Terms and Conditions.
            </p>
          </article>
        </section>
      </main>
    </Layout>
  )
}
