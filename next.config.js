/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/nodemonkes-gif',
  assetPrefix: '/nodemonkes-gif/',
}

module.exports = nextConfig

