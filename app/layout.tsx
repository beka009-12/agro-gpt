import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { I18nProvider } from "@/src/i18n/client";
import { getDictionary } from "@/src/i18n/dictionaries";
import { getDict, getLocale } from "@/src/i18n/server";
import { Providers } from "./providers";
import "./globals.css";

// Manrope остаётся только для хедера — его дизайн зафиксирован (см. header.tsx)
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "cyrillic-ext"],
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
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
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
      className={`${manrope.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider locale={locale} dict={dict}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
