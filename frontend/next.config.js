/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Configuration pour utiliser l'exportation statique
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true // Optionnel si tu n'utilises pas d'optimisation d'images
  }
}

module.exports = nextConfig
