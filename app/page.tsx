import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { FloatingNav } from "@/src/components/layout/floating-nav"
import { Hero } from "@/src/components/landing/hero"
import { Features } from "@/src/components/landing/features"
import { HowItWorks } from "@/src/components/landing/how-it-works"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
      <FloatingNav />
    </>
  )
}
