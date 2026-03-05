import "../styles/globals.css"
import Header from "../components/Header"
import Footer from "../components/footer"

export const metadata = {
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
