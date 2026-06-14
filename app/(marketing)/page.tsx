import { HeroSection } from "@/components/home/hero-section"
import { AboutSection } from "@/components/home/about-section"
import { LiveBatchesSection } from "@/components/home/live-batches-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <main>
        <AboutSection />
        <LiveBatchesSection />
        <TestimonialsSection />
      </main>
    </>
  )
}
