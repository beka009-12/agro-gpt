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

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.meta.title, description: dict.meta.description };
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
