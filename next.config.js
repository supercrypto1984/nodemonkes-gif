/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nodemonkes.4everland.store',
        port: '',
        pathname: '/**',
      },
    ],
  },
  assetPrefix: '/nodemonkes-gif/',
}

module.exports = nextConfig

