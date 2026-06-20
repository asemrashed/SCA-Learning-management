import { HeroSection } from "@/components/home/hero-section"
import { AboutSection } from "@/components/home/about-section"
import { LiveCoursesSection } from "@/components/home/live-courses-section"
import { LiveBatchesSection } from "@/components/home/live-batches-section"
import { LearningCategories } from "@/components/home/learning-categories"
import { RecordedCoursesSection } from "@/components/home/recorded-courses-section"
import { HomeTestimonialsSection } from "@/components/home/home-testimonials-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <main>
        <AboutSection />
        <LiveCoursesSection />
        <LiveBatchesSection />
        <LearningCategories />
        <RecordedCoursesSection />
        <HomeTestimonialsSection />
      </main>
    </>
  )
}
