/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: '/femwpai',
  assetPrefix: '/femwpai/'
};

module.exports = nextConfig; 