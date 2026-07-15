import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { FloatingNav } from "@/src/components/layout/floating-nav"
import { Hero } from "@/src/components/landing/hero"
import { Audience } from "@/src/components/landing/audience"
import { Features } from "@/src/components/landing/features"
import { HowItWorks } from "@/src/components/landing/how-it-works"
import { CtaBanner } from "@/src/components/landing/cta-banner"

export default function Home() {
  return (
    <>
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
