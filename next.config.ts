import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // TheSportsDB player cutout images (verified no hotlink protection)
      { protocol: "https", hostname: "r2.thesportsdb.com", pathname: "/images/**" },
    ],
  },
};

export default nextConfig;
