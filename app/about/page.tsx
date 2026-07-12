import type { Metadata } from "next"
import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { FloatingNav } from "@/src/components/layout/floating-nav"
import { AboutHero } from "@/src/components/about/about-hero"
import { BrandCard } from "@/src/components/about/brand-card"
import { Activities } from "@/src/components/about/activities"
import { Product } from "@/src/components/about/product"
import { Packaging } from "@/src/components/about/packaging"
import { Mission } from "@/src/components/about/mission"
import { getDict } from "@/src/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict()
  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
  }
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutHero />
        <BrandCard />
        <Activities />
        <Product />
        <Packaging />
        <Mission />
      </main>
      <Footer />
      <FloatingNav showHome />
    </>
  )
}
