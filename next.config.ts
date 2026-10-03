import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // История чата отдаёт фото относительным путём (/media/images/<uuid>.webp) с бэкенда.
  // Проксируем через свой origin: иначе 404 на нашем домене и mixed content (бэкенд по http).
  async rewrites() {
    const apiUrl = process.env.API_URL?.replace(/\/+$/, "");
    if (!apiUrl) return [];
    return [
      {
        source: "/media/images/:path*",
        destination: `${apiUrl}/media/images/:path*`,
      },
    ];
  },
};

export default nextConfig;
