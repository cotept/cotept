import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.cotept.com",
        port: "", // 포트는 비워두면 기본 443(https)이 적용
        pathname: "/public/**",
      },
    ],
  },
}

export default nextConfig
