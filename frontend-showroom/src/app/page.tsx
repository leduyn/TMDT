'use client'
import Navbar from '@/components/b2b/Navbar'
import HeroSection from '@/components/b2b/HeroSection'
import ServiceHighlights from '@/components/b2b/ServiceHighlights'
import StatsSection from '@/components/b2b/StatsSection'
import SolutionsSection from '@/components/b2b/SolutionsSection'
import CTASection from '@/components/b2b/CTASection'
import Footer from '@/components/b2b/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServiceHighlights />
        <StatsSection />
        <SolutionsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
