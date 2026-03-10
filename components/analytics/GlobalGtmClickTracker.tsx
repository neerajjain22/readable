"use client"

import { useEffect } from "react"

type DataLayerEvent = {
  event: string
  [key: string]: string | number | boolean | null | undefined
}

type DataLayerWindow = Window & {
  dataLayer?: DataLayerEvent[]
}

export function pushDataLayerEvent(payload: DataLayerEvent) {
  if (typeof window === "undefined") {
    return
  }

  const w = window as DataLayerWindow
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(payload)
}

function isBookDemoLink(url: URL) {
  if (url.pathname === "/book-demo") {
    return true
  }

  return url.hostname === "cal.com" || url.hostname.endsWith(".cal.com")
}

export default function GlobalGtmClickTracker() {
  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (!target) {
        return
      }

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null
      if (!anchor) {
        return
      }

      let destination: URL
      try {
        destination = new URL(anchor.href, window.location.origin)
      } catch {
        return
      }

      if (!isBookDemoLink(destination)) {
        return
      }

      pushDataLayerEvent({
        event: "book_demo_click",
        destination_url: destination.href,
        destination_type: destination.pathname === "/book-demo" ? "internal" : "external",
      })
    }

    document.addEventListener("click", onDocumentClick, true)

    return () => {
      document.removeEventListener("click", onDocumentClick, true)
    }
  }, [])

  return null
}
