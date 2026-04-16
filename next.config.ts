import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Default image-optimization fetch timeout is short; slow Cloudinary responses
   * cause "upstream image response timed out" on `/_next/image`. Increase if needed.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
   */
  experimental: {
    imgOptTimeoutInSeconds: 30,
  },
  images: {
    /** Cache optimized images longer to avoid re-fetching Cloudinary on every request. */
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/exhibition",
        destination: "/sponsors",
        permanent: true,
      },
      {
        source: "/exhibition/:slug",
        destination: "/company/:slug",
        permanent: true,
      },
      {
        source: "/exhibitor/:path*",
        destination: "/company/:path*",
        permanent: true,
      },
      {
        source: "/admin/dashboard/exhibitors",
        destination: "/admin/dashboard/companies",
        permanent: false,
      },
      {
        source: "/admin/dashboard/sponsors",
        destination: "/admin/dashboard/companies",
        permanent: false,
      },
      {
        source: "/admin/dashboard/branding",
        destination: "/admin/dashboard/marketing",
        permanent: false,
      },
      {
        source: "/company/branding",
        destination: "/company/sponsorship-plans?tab=branding",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
