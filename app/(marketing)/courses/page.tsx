"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseCatalog } from "@/features/course/components/course-catalog"

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <CourseCatalog />
        </div>
      </main>
      <Footer />
    </div>
  )
}
