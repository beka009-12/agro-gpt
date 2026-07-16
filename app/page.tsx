import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { FloatingNav } from "@/src/components/layout/floating-nav"
import { Hero } from "@/src/components/landing/hero"
import { Audience } from "@/src/components/landing/audience"
import { Features } from "@/src/components/landing/features"
import { HowItWorks } from "@/src/components/landing/how-it-works"
import { CtaBanner } from "@/src/components/landing/cta-banner"
import { getDict } from "@/src/i18n/server"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default async function Home() {
  const dict = await getDict()
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "ibo",
        url: SITE_URL,
        description: dict.meta.description,
      },
      {
        "@type": "WebSite",
        name: "ibo",
        url: SITE_URL,
        inLanguage: ["ky", "ru", "en"],
      },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <Audience />
        <Features />
        <HowItWorks />
        <CtaBanner />
      </main>
      <Footer />
      <FloatingNav />
    </>
  )
}
