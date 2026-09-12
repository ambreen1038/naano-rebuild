import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Brand Portal used to live under /dashboard/* — these keep any
  // existing bookmark or deep link working after the move to /brand/*.
  // The "results" -> "analytics" rename needs its own rule first, since the
  // generic catch-all below would otherwise send it to a route that no
  // longer exists (/brand/results instead of /brand/analytics).
  async redirects() {
    return [
      {
        source: "/dashboard/results/:path*",
        destination: "/brand/analytics/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/brand/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
