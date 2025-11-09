import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms-media.section-l.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
