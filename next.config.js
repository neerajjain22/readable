/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/ai-search-field-guide",
        destination: "https://www.tryreadable.ai/guides/ai-search-field-guide",
        permanent: true,
      },
      {
        source: "/resources/guides",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/resources/guides/:slug",
        destination: "/guides/:slug",
        permanent: true,
      },
      {
        source: "/knowledge-hub",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/product/agent-website",
        destination: "/platform/agent-ready-pages",
        permanent: true,
      },
      {
        source: "/ai-agents-brand-clarity",
        destination: "/",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
