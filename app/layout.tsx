import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Onest } from "next/font/google";
import { I18nProvider } from "@/src/i18n/client";
import { getDictionary } from "@/src/i18n/dictionaries";
import { getDict, getLocale } from "@/src/i18n/server";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

const OG_LOCALES: Record<string, string> = {
  ru: "ru_RU",
  ky: "ky_KG",
  en: "en_US",
};

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  const locale = await getLocale();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: "ibo",
      type: "website",
      locale: OG_LOCALES[locale] ?? "ru_RU",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${onest.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider locale={locale} dict={dict}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
