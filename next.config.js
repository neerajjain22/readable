/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
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

