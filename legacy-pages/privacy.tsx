import Layout from "../components/Layout"
import Seo from "../components/Seo"
import Breadcrumbs from "../components/Breadcrumbs"
import styles from "../styles/Page.module.css"

export default function PrivacyPage() {
  return (
    <Layout>
      <Seo
        title="Privacy Policy | Readable"
        description="Readable privacy policy covering data collection, usage, retention, and user rights."
        path="/privacy"
      />
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.container}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
            <h1 className={styles.heroTitle}>Privacy Policy</h1>
            <p className={styles.heroDescription}>Effective Date: August 25, 2025</p>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <article className={styles.container}>
            <p className={styles.text}>
              SonicLinker, Inc. ("SonicLinker," "Company," "we," "our," or "us") builds agentic commerce
              infrastructure, including AI traffic analytics, an Agentic CDN, and Agentic Commerce APIs (beta).
              This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use
              our websites, dashboards, SDKs, APIs, and related services (collectively, the "Services").
            </p>

            <h2 className={styles.mtMd}>Scope & Roles</h2>
            <p className={styles.text}>
              When you visit our websites or interact with us as a prospective or existing customer, we act as a
              controller of your personal information.
            </p>
            <p className={styles.text}>
              When our customers deploy SonicLinker on their own properties (for example, websites and apps) to
              measure or serve AI agents and users, we act as a processor or service provider to those customers.
              In that case, the customer&apos;s privacy policy governs, and we process data according to our Data
              Processing Addendum ("DPA").
            </p>

            <h2 className={styles.mtMd}>Information We Collect</h2>
            <h3 className={styles.mtSm}>A. Business & Website Visitor Information (we are the Controller)</h3>
            <p className={styles.text}>
              We collect information you provide and information collected automatically when you interact with our
              websites, demo pages, and sales/support channels:
            </p>
            <ul className={styles.list}>
              <li>Contact & account data: name, email, company, role, phone, authentication, and workspace settings.</li>
              <li>
                Billing data: billing address, tax IDs, and limited payment details (processed by our payment
                provider; we do not store full card numbers).
              </li>
              <li>Communications: emails, support chats, meeting notes, feedback, and survey responses.</li>
              <li>
                Device & usage data: IP address (which may indicate approximate location), user-agent, referrer,
                pages viewed, timestamps, product usage events, and cookies or similar technologies.
              </li>
            </ul>

            <h3 className={styles.mtSm}>B. Service Data From Customer Properties (we are the Processor)</h3>
            <p className={styles.text}>
              When customers implement our SDKs, APIs, or server-side collectors on their sites/apps, we process
              data on their behalf, including:
            </p>
            <ul className={styles.list}>
              <li>
                Request metadata: IP address, user-agent and model signatures, referrer, URL path and query
                parameters, HTTP headers, timestamps, and response codes.
              </li>
              <li>
                Event & performance metrics: page loads, route changes, latency, error events, and dwell or
                engagement signals.
              </li>
              <li>
                Derived classifications: AI-agent vs human detection, detected agent class/model where available,
                intent categories, and fraud/abuse risk scores.
              </li>
              <li>
                Identifiers: first-party cookie/local-storage IDs and/or server-issued pseudonymous IDs scoped to a
                customer domain, plus optional customer-provided user/order IDs where configured.
              </li>
              <li>
                Content served via Agentic CDN: machine-readable page variants, structured responses, and
                personalization rules applied to agents based on intent and context.
              </li>
            </ul>
            <p className={styles.text}>
              Important: We do not intentionally collect sensitive categories (for example, government IDs, health,
              or precise geolocation) via our SDKs. Customers should avoid sending such data and can configure
              field masking. We do not perform cross-site tracking or fingerprinting for advertising.
            </p>

            <h3 className={styles.mtSm}>C. Integrations & Sources You Connect</h3>
            <p className={styles.text}>
              If you connect third-party systems (for example, Shopify, Cloudflare Workers, GTM, product catalogs,
              review systems, or helpdesk/CRM tools), we receive the data necessary to provide the integrations you
              enable. The type and volume of data depend on your configuration and granted permissions.
            </p>

            <h3 className={styles.mtSm}>D. Payment & Transaction Metadata (Agentic Commerce APIs - optional)</h3>
            <p className={styles.text}>
              If you enable checkout or payments features powered by partners, we process transaction metadata
              (such as order ID, amount, currency, and non-sensitive line items) as a processor. Sensitive payment
              data is handled by the payment provider under its own policies.
            </p>

            <h2 className={styles.mtMd}>How We Use Information</h2>
            <h3 className={styles.mtSm}>As Controller (Business & Website Data)</h3>
            <ul className={styles.list}>
              <li>Provide and improve the Services, including authentication, operations, and troubleshooting.</li>
              <li>
                Communicate with you for support, service notices, onboarding, and (where permitted) product and
                marketing updates.
              </li>
              <li>Detect fraud, prevent misuse, and protect users and Services.</li>
              <li>Comply with legal obligations, enforce agreements, and defend legal claims.</li>
            </ul>

            <h3 className={styles.mtSm}>As Processor (Service Data on Customer Properties)</h3>
            <ul className={styles.list}>
              <li>Measure and classify traffic, including AI-agent vs human detection and engagement metrics.</li>
              <li>Serve content via Agentic CDN according to customer configuration.</li>
              <li>Provide analytics/reporting dashboards, alerts, and export APIs.</li>
              <li>Maintain reliability/security through monitoring, anomaly detection, and audit logs.</li>
              <li>
                Produce aggregated, de-identified benchmark insights that do not identify individuals or customers.
              </li>
            </ul>

            <h2 className={styles.mtMd}>Cookies & Similar Technologies</h2>
            <p className={styles.text}>
              We use first-party cookies and similar technologies to remember preferences, keep users signed in,
              and analyze product usage. Where required by law, we or our customers obtain consent. We respect
              supported browser signals such as Global Privacy Control (GPC) where applicable.
            </p>

            <h2 className={styles.mtMd}>How We Share Information</h2>
            <p className={styles.text}>
              We do not sell or "share" personal information for cross-context behavioral advertising.
            </p>
            <p className={styles.text}>We share information as follows:</p>
            <ul className={styles.list}>
              <li>
                Service providers/sub-processors for hosting, security, logging/monitoring, communications, support,
                and payments under confidentiality and data protection obligations.
              </li>
              <li>Customer-directed disclosures to systems and partners you choose to connect.</li>
              <li>Legal and safety disclosures to comply with law or protect rights and safety.</li>
              <li>Business transfers such as mergers, acquisitions, or asset sales (with notice where required).</li>
            </ul>

            <h2 className={styles.mtMd}>Data Retention</h2>
            <ul className={styles.list}>
              <li>
                Business & website data (controller): retained while your account is active and as needed for the
                purposes above; marketing data is retained until you unsubscribe or request deletion.
              </li>
              <li>
                Service data (processor): customer-configurable. If not configured, default retention is 13 months
                for event-level logs, after which we delete or aggregate data.
              </li>
            </ul>

            <h2 className={styles.mtMd}>Security</h2>
            <p className={styles.text}>
              We use administrative, technical, and physical safeguards designed to protect information, including
              encryption in transit and at rest, least-privilege access controls, and regular monitoring.
            </p>

            <h2 className={styles.mtMd}>International Data Transfers</h2>
            <p className={styles.text}>
              We may process and store information in countries other than where it is collected. Where required,
              we use appropriate transfer mechanisms, such as Standard Contractual Clauses (SCCs). For processor
              activities, our DPA governs transfers and sub-processors.
            </p>

            <h2 className={styles.mtMd}>Your Rights & Choices</h2>
            <p className={styles.text}>Your rights depend on your location and role:</p>
            <ul className={styles.list}>
              <li>
                Website visitors & business contacts (controller): you may request access, correction, deletion,
                restriction, portability, or object to processing, and opt out of marketing.
              </li>
              <li>
                End users & AI agents on customer properties (processor): contact the relevant customer (site/app
                owner). We assist customers as required by law and the DPA.
              </li>
              <li>
                California and other U.S. state rights may include access/know, delete, correct, and opt out of
                certain processing. We do not sell or share personal information for targeted advertising.
              </li>
            </ul>
            <p className={styles.text}>
              To make a request, email{" "}
              <a className={styles.inlineLink} href="mailto:privacy@soniclinker.com">
                privacy@soniclinker.com
              </a>
              . We may verify your identity and relationship to a customer.
            </p>

            <h2 className={styles.mtMd}>Children&apos;s Privacy</h2>
            <p className={styles.text}>
              Our Services are not directed to children under 16, and we do not knowingly collect personal
              information from them.
            </p>

            <h2 className={styles.mtMd}>Third-Party Links</h2>
            <p className={styles.text}>
              Our websites and dashboards may link to third-party sites or services. Their privacy practices are
              governed by their own policies.
            </p>

            <h2 className={styles.mtMd}>Changes to This Policy</h2>
            <p className={styles.text}>
              We may update this Policy from time to time. We will post the updated version with a new effective
              date and, if changes are material, provide additional notice.
            </p>

            <h2 className={styles.mtMd}>Contact Us</h2>
            <p className={styles.text}>
              If you have questions, requests, or complaints about this Policy or our data practices, contact:
            </p>
            <ul className={styles.list}>
              <li>
                Email:{" "}
                <a className={styles.inlineLink} href="mailto:hello@soniclinker.com">
                  hello@soniclinker.com
                </a>
              </li>
              <li>Address: 380 Brannan St, San Francisco, CA 94107</li>
            </ul>

            <h2 className={styles.mtMd}>Processor Annex (Summary)</h2>
            <p className={styles.text}>For customers using SonicLinker on their properties:</p>
            <ul className={styles.list}>
              <li>
                Nature/Purpose: measurement and classification of AI agents and users; content delivery via Agentic
                CDN; optional commerce/checkout integrations.
              </li>
              <li>
                Types of data: request metadata, event metrics, derived classifications, pseudonymous identifiers,
                customer-provided fields, and optional transaction metadata.
              </li>
              <li>Data subjects: visitors/users of customer properties and AI agents interacting with them.</li>
              <li>Retention: customer-configurable, with a 13-month default for event-level logs.</li>
              <li>
                Security measures: encryption in transit/at rest, access controls, monitoring, and vulnerability
                management.
              </li>
              <li>Sub-processors: standard cloud infrastructure and service vendors; list available upon request.</li>
            </ul>

            <p className={`${styles.text} ${styles.mtMd}`}>
              Note: This Privacy Policy is a general description of practices and is not legal advice. Customers
              should consult counsel when configuring SonicLinker and updating their own privacy notices.
            </p>
          </article>
        </section>
      </main>
    </Layout>
  )
}
