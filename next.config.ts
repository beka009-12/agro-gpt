import type { NextConfig } from "next";

// Без script-src: строгий CSP для Next требует nonce и динамического рендеринга всех страниц
const CONTENT_SECURITY_POLICY = [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Геолокация нужна чату, камера — для фото растения
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(self), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
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
