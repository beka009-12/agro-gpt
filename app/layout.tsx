import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { I18nProvider } from "@/src/i18n/client";
import { getDictionary } from "@/src/i18n/dictionaries";
import { getDict, getLocale } from "@/src/i18n/server";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
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
    <html lang={locale} className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider locale={locale} dict={dict}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
