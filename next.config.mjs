/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  ...(process.env.CLOUDFLARE_PAGES === "1"
    ? { output: "export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
