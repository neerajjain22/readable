import "../styles/globals.css"
import type { Metadata } from "next"
import Script from "next/script"
import GlobalGtmClickTracker from "../components/analytics/GlobalGtmClickTracker"
import Header from "../components/Header"
import Footer from "../components/footer"

const BASE_URL = "https://www.tryreadable.ai"
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WG6228HL"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? BASE_URL),
  title: {
    default: "Readable",
    template: "%s | Readable",
  },
  description: "AI influence analytics platform",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {GTM_ID ? (
          <Script id="google-tag-manager" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        ) : null}
      </head>
      <body>
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        <GlobalGtmClickTracker />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
