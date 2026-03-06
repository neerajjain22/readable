import "../styles/globals.css"
import Header from "../components/Header"
import Footer from "../components/footer"

const BASE_URL = "https://www.tryreadable.ai"

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? BASE_URL),
  title: {
    default: "Readable",
    template: "%s | Readable",
  },
  description: "AI influence analytics platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
