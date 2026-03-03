import { type ReactNode, useState } from "react"
import HeroSection from "./HeroSection"
import styles from "../styles/Home.module.css"

const cn = (...classNames: Array<string | false | undefined>) => classNames.filter(Boolean).join(" ")

const platformFeatures = [
    {
        title: "AI Visibility",
        description:
            "See how LLMs describe your brand and competitors. Track positioning and changes over time.",
    },
    {
        title: "Agent Analytics",
        description: "Identify AI agents visiting your site and understand traffic patterns.",
    },
    {
        title: "Agent-Ready Pages",
        description: "Create structured pages optimized for AI systems and retrieval tools.",
    },
]

const demoBullets = [
    "How LLMs describe your brand",
    "Where competitors are positioned differently",
    "AI agent traffic hitting your site",
    "Gaps in how AI systems interpret your pages",
    "Opportunities to improve visibility",
]

const testimonials = [
    {
        quote: "Readable gave us a clear view of how AI models represent our category and where we were getting lost.",
        name: "Maya Carter",
        title: "VP Marketing",
        company: "GrowthOps",
    },
    {
        quote: "We now track AI-driven traffic with confidence and can explain impact to leadership with real data.",
        name: "Ethan Brooks",
        title: "Head of Demand Gen",
        company: "Northline",
    },
    {
        quote: "The agent-ready recommendations helped us improve discoverability faster than expected.",
        name: "Sonia Patel",
        title: "Director of Digital",
        company: "Stacklane",
    },
]

const faqItems = [
    {
        question: "What AI systems do you monitor?",
        answer:
            "Readable monitors major LLM-driven discovery surfaces and AI agents interacting with your brand presence, then maps how your positioning shifts over time.",
    },
    {
        question: "Is this SEO?",
        answer:
            "Readable complements SEO. Instead of only focusing on traditional rankings, it helps you understand and improve how AI systems interpret and reference your brand.",
    },
    {
        question: "How long does setup take?",
        answer:
            "Most teams are up quickly. Initial setup is lightweight, and you can start seeing baseline insights shortly after connecting your domain.",
    },
    {
        question: "Do I need engineering resources?",
        answer:
            "Not for core onboarding. Product and marketing teams can get started directly, with optional technical support for deeper implementation.",
    },
    {
        question: "Do you offer agency plans?",
        answer:
            "Yes. Agency plans include multi-client workflows, white-labeled insights, and dedicated support.",
    },
]

const investors = [
    "South Park Commons",
    "Investor Placeholder",
    "Operator Fund",
    "Growth Partners",
    "Capital Studio",
    "Founders Collective",
]

function Container({ children }: { children: ReactNode }) {
    return <div className={styles.container}>{children}</div>
}

function PrimaryButton({ children }: { children: ReactNode }) {
    return (
        <button className={cn(styles.button, styles.buttonPrimary)} type="button">
            {children}
        </button>
    )
}

function SecondaryButton({ children }: { children: ReactNode }) {
    return (
        <button className={cn(styles.button, styles.buttonSecondary)} type="button">
            {children}
        </button>
    )
}

function LogoStrip() {
    const logos = ["Logo One", "Logo Two", "Logo Three", "Logo Four", "Logo Five", "Logo Six"]

    return (
        <section className={styles.section} aria-labelledby="logos-title">
            <Container>
                <h2 id="logos-title" className={styles.mutedTitle}>
                    Trusted by Modern Growth Teams
                </h2>
                <div className={styles.logoGrid}>
                    {logos.map((logo) => (
                        <div className={styles.logoItem} key={logo} aria-label={logo}>
                            {logo}
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}

function PlatformOverview() {
    return (
        <section className={styles.section} aria-labelledby="platform-title">
            <Container>
                <div className={styles.sectionHeader}>
                    <h2 id="platform-title" className={styles.sectionTitle}>
                        The Readable Platform
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Everything you need to monitor and improve how AI systems interpret your brand.
                    </p>
                </div>
                <div className={styles.cardGrid}>
                    {platformFeatures.map((feature) => (
                        <article className={cn(styles.card, styles.cardInteractive)} key={feature.title}>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardText}>{feature.description}</p>
                        </article>
                    ))}
                </div>
            </Container>
        </section>
    )
}

function DemoValueSection() {
    return (
        <section className={cn(styles.section, styles.sectionAlt)} aria-labelledby="demo-title">
            <Container>
                <div className={cn(styles.sectionHeader, styles.sectionHeaderLeft)}>
                    <h2 id="demo-title" className={styles.sectionTitle}>
                        What We'll Show You
                    </h2>
                </div>
                <ul className={styles.bulletList}>
                    {demoBullets.map((item) => (
                        <li className={styles.bulletItem} key={item}>
                            {item}
                        </li>
                    ))}
                </ul>
                <div className={styles.leftCtaRow}>
                    <PrimaryButton>Book a Demo</PrimaryButton>
                </div>
            </Container>
        </section>
    )
}

function TestimonialsSection() {
    return (
        <section className={styles.section} aria-labelledby="testimonials-title">
            <Container>
                <div className={styles.sectionHeader}>
                    <h2 id="testimonials-title" className={styles.sectionTitle}>
                        What Teams Are Saying
                    </h2>
                </div>
                <div className={styles.cardGrid}>
                    {testimonials.map((testimonial) => (
                        <article className={cn(styles.card, styles.cardInteractive)} key={testimonial.name}>
                            <p className={styles.quote}>"{testimonial.quote}"</p>
                            <p className={styles.person}>{testimonial.name}</p>
                            <p className={styles.meta}>
                                {testimonial.title}, {testimonial.company}
                            </p>
                        </article>
                    ))}
                </div>
            </Container>
        </section>
    )
}

function AgencySection() {
    return (
        <section className={cn(styles.section, styles.sectionAlt)} aria-labelledby="agency-title">
            <Container>
                <div className={cn(styles.sectionHeader, styles.sectionHeaderLeft)}>
                    <h2 id="agency-title" className={styles.sectionTitle}>
                        Built for Agencies
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Offer AI visibility and agent analytics as part of your client stack.
                    </p>
                </div>
                <ul className={styles.bulletList}>
                    <li className={styles.bulletItem}>Multi-client dashboard</li>
                    <li className={styles.bulletItem}>White-labeled insights</li>
                    <li className={styles.bulletItem}>Simple onboarding</li>
                    <li className={styles.bulletItem}>Dedicated support</li>
                </ul>
                <div className={styles.leftCtaRow}>
                    <SecondaryButton>Become an Agency Partner</SecondaryButton>
                </div>
            </Container>
        </section>
    )
}

function InvestorsSection() {
    return (
        <section className={styles.section} aria-labelledby="investors-title">
            <Container>
                <div className={styles.sectionHeader}>
                    <h2 id="investors-title" className={styles.sectionTitle}>
                        Backed by Experienced Operators
                    </h2>
                </div>
                <div className={styles.logoGrid}>
                    {investors.map((name) => (
                        <div className={styles.logoItem} key={name}>
                            {name}
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}

function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <section className={styles.section} aria-labelledby="faq-title">
            <Container>
                <div className={styles.sectionHeader}>
                    <h2 id="faq-title" className={styles.sectionTitle}>
                        Frequently Asked Questions
                    </h2>
                </div>
                <div className={styles.faqList}>
                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index
                        const buttonId = `faq-button-${index}`
                        const panelId = `faq-panel-${index}`

                        return (
                            <div className={styles.faqItem} key={item.question}>
                                <h3 className={styles.faqTitle}>
                                    <button
                                        id={buttonId}
                                        className={styles.faqTrigger}
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                        type="button"
                                    >
                                        <span>{item.question}</span>
                                        <span className={cn(styles.faqIcon, isOpen && styles.faqIconOpen)}>+</span>
                                    </button>
                                </h3>
                                <div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={buttonId}
                                    className={cn(styles.faqPanel, isOpen && styles.faqPanelOpen)}
                                >
                                    <div className={styles.faqContent}>
                                        <p className={styles.faqAnswer}>{item.answer}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}

function FinalCTASection() {
    return (
        <section className={cn(styles.section, styles.sectionAlt, styles.finalCtaSection)} aria-labelledby="final-cta-title">
            <Container>
                <div className={styles.finalCtaInner}>
                    <h2 id="final-cta-title" className={styles.sectionTitle}>
                        Start Understanding Your AI Presence.
                    </h2>
                    <div className={styles.ctaStack}>
                        <PrimaryButton>Book a Demo</PrimaryButton>
                        <SecondaryButton>Analyze My Site</SecondaryButton>
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default function ReadableHomepage() {
    return (
        <main className={styles.page}>
            <HeroSection />
            <LogoStrip />
            <PlatformOverview />
            <DemoValueSection />
            <TestimonialsSection />
            <AgencySection />
            <InvestorsSection />
            <FAQSection />
            <FinalCTASection />
        </main>
    )
}
