import { HeroSection } from "@/components/home/hero-section"
import { AboutSection } from "@/components/home/about-section"
import { LearningCategories } from "@/components/home/learning-categories"
import { FeaturedCourses } from "@/components/home/featured-courses"
import { LiveBatchesSection } from "@/components/home/live-batches-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <main>
        <AboutSection />
        <FeaturedCourses />
        <LearningCategories />
        <LiveBatchesSection />
        <TestimonialsSection />
      </main>
    </>
  )
}
