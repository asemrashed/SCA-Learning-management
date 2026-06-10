import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { AboutSection } from "@/components/home/about-section"
import { LearningCategories } from "@/components/home/learning-categories"
import { FeaturedCourses } from "@/components/home/featured-courses"
import { FreeMasterclass } from "@/components/home/free-masterclass"
import { TestimonialsSection } from "@/components/home/testimonials-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Spacer scrolls away; navbar sticks for the full page at top-[10px] */}
      <div className="pt-6 md:pt-8" />
      <header className="sticky top-[10px] z-[100] px-4">
        <Navbar variant="floating" />
      </header>

      <HeroSection />

      <main>
        <AboutSection />
        <FeaturedCourses />
        <LearningCategories />
        <FreeMasterclass />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
