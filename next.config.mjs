const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms-media.section-l.co",
        port: "",
        pathname: "/**",
      },
    ],
    // Disable Next's server-side image optimization to let browsers load remote images directly.
    // This avoids server-side fetches that can fail when upstream resolves to private IPs
    // (useful as a developer/workaround; consider adding proper Cache-Control on the CDN/S3 later).
    unoptimized: true,
  },
};

export default nextConfig;
