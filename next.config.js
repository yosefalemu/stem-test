/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "bbafbtqycmgvlyungeqn.supabase.co",
      "vggefailroiumcklfbxv.supabase.co"
    ],
    formats: ['image/avif', 'image/webp', 'image/jpeg'],
    deviceSizes: [400, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://stem-phi.vercel.app',
  },
  // Enable static exports for better social media preview
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/landingpage-2',
  //       permanent: false,
  //     },
  //   ];
  // },

  async rewrites() {
    return [
      {
        source: '/race/:id',
        destination: '/sound-race/:id',
      },
    ];
  },

  // redirects() {
  //   return ["/"].map((source) => ({
  //     source,
  //     destination: "/sound-race/d5cf2093-d449-444a-aea9-d60073505500",
  //     permanent: false,
  //   }));
  // },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
