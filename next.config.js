/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/ai-search-field-guide",
        destination: "https://tryreadable.ai/guides/ai-search-field-guide",
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
    ]
  },
}

module.exports = nextConfig
