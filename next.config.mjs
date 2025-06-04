/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['rtlnl.prismic.io', 'images.prismic.io', 'img.youtube.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rtlnl.prismic.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.prismic.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
