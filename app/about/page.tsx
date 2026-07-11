import type { Metadata } from "next"
import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { AboutHero } from "@/src/components/about/about-hero"
import { BrandCard } from "@/src/components/about/brand-card"
import { Activities } from "@/src/components/about/activities"
import { Product } from "@/src/components/about/product"
import { Packaging } from "@/src/components/about/packaging"
import { Mission } from "@/src/components/about/mission"
import ru from "@/src/i18n/ru.json"

export const metadata: Metadata = {
  title: ru.about.metaTitle,
  description: ru.about.metaDescription,
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
    </>
  )
}
