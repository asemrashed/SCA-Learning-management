"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { formatBdt } from "@/lib/format-currency"
import { Footer } from "@/components/footer"
import { FAQAccordion } from "@/components/faq-accordion"
import { ReviewCard } from "@/components/review-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Users,
  Clock,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  FileText,
  Headphones,
  BookOpen,
  ArrowRight,
} from "lucide-react"
import { motion } from "framer-motion"

const courseData = {
  id: "1",
  title: "Full Stack Web Development with Python, Django & React",
  description:
    "Learn to build complete web applications from scratch using Python, Django for the backend, and React for the frontend. This comprehensive course covers everything from fundamentals to advanced concepts.",
  image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
  price: 299,
  originalPrice: 499,
  discount: 40,
  rating: 4.8,
  reviewCount: 1245,
  students: 5320,
  duration: "120 hours",
  batch: "Batch 7",
  seatsLeft: 36,
  daysLeft: 20,
  startDate: "February 15, 2026",
  language: "English & Bengali",
  level: "Beginner to Advanced",
  category: "Web & App Development",
}

const modules = [
  {
    id: "1",
    title: "Python Fundamentals",
    lessons: 12,
    duration: "2h 30m",
    progress: 30,
  },
  {
    id: "2",
    title: "Django Basics",
    lessons: 15,
    duration: "4h 10m",
    progress: 0,
  },
  {
    id: "3",
    title: "Database Models & ORM",
    lessons: 10,
    duration: "3h 45m",
    progress: 0,
  },
  {
    id: "4",
    title: "React.js Fundamentals",
    lessons: 18,
    duration: "5h 20m",
    progress: 0,
  },
  {
    id: "5",
    title: "REST API Development",
    lessons: 14,
    duration: "3h 15m",
    progress: 0,
  },
  {
    id: "6",
    title: "Authentication & Security",
    lessons: 11,
    duration: "2h 50m",
    progress: 0,
  },
  {
    id: "7",
    title: "React + Django Integration",
    lessons: 13,
    duration: "4h 40m",
    progress: 0,
  },
  {
    id: "8",
    title: "Deployment & Hosting",
    lessons: 9,
    duration: "2h 20m",
    progress: 0,
  },
]

const features = [
  "100+ video lectures",
  "20+ practical projects",
  "Live support sessions",
  "Lifetime access",
  "Certificate of completion",
  "Job placement support",
]

const instructor = {
  name: "Ahmed Rahman",
  title: "Senior Full Stack Developer",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  rating: 4.9,
  students: 12540,
  courses: 7,
  bio: "Ahmed is a seasoned full-stack developer with over 8 years of experience in web development. He has worked with numerous startups and established companies, building scalable web applications.",
}

const reviews = [
  {
    name: "Fatima Akter",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    review: "This course completely transformed my career. The instructors explain everything so clearly. Highly recommended!",
    course: "Full Stack Development",
    batch: "Batch 7",
  },
  {
    name: "Rahim Khan",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    review: "The project-based learning approach is amazing. Every module ends with a practical project that helps reinforce the concepts.",
    course: "Full Stack Development",
    batch: "Batch 7",
  },
]

const faqs = [
  {
    question: "What are the prerequisites for this course?",
    answer: "No prior programming experience is required. We start from the absolute basics and gradually progress to advanced topics.",
  },
  {
    question: "How long will I have access to the course?",
    answer: "You will have lifetime access to all course materials, including any future updates.",
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied with the course, you can request a full refund within 7 days of purchase.",
  },
  {
    question: "Will I get a certificate?",
    answer: "Yes, upon successful completion of the course and all assignments, you will receive a verified certificate of completion.",
  },
  {
    question: "What kind of support is available?",
    answer: "We offer 18-hour live support, dedicated Discord community, and weekly Q&A sessions with instructors.",
  },
]

export default function CourseDetailsPage() {
  const [showAllModules, setShowAllModules] = useState(false)
  const displayedModules = showAllModules ? modules : modules.slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-[24px] bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 md:p-8"
              >
                <Badge className="mb-4 bg-destructive">Live Course</Badge>
                <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                  {courseData.title}
                </h1>
                <p className="mb-6 text-muted-foreground">{courseData.description}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{courseData.rating}</span>
                    <span className="text-muted-foreground">({courseData.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{courseData.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{courseData.duration}</span>
                  </div>
                </div>
              </motion.div>

              {/* Course Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-[20px] bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-bold text-foreground">Course Overview</h2>
                <p className="mb-6 text-muted-foreground leading-relaxed">
                  This comprehensive course will take you from a complete beginner to a professional full-stack 
                  developer. You&apos;ll learn how to build complete web applications using Python, Django, and React,
                  with hands-on projects that mirror real-world scenarios.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Curriculum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-[20px] bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-bold text-foreground">Course Curriculum</h2>
                <div className="space-y-3">
                  {displayedModules.map((module) => (
                    <div
                      key={module.id}
                      className="rounded-xl bg-muted/50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Module {module.id}: {module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons} lessons • {module.duration}
                          </p>
                        </div>
                        <Play className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {module.progress > 0 && (
                        <Progress value={module.progress} className="mt-3 h-2" />
                      )}
                    </div>
                  ))}
                </div>
                {modules.length > 4 && (
                  <Button
                    variant="ghost"
                    className="mt-4 w-full"
                    onClick={() => setShowAllModules(!showAllModules)}
                  >
                    {showAllModules ? (
                      <>
                        Show Less <ChevronUp className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        + {modules.length - 4} more modules <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </motion.div>

              {/* Instructor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-[20px] bg-card p-6 shadow-sm"
              >
                <h2 className="mb-4 text-xl font-bold text-foreground">Instructor</h2>
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={instructor.image}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">{instructor.title}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {instructor.rating} rating
                      </span>
                      <span>{instructor.students.toLocaleString()} students</span>
                      <span>{instructor.courses} courses</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {instructor.bio}
                </p>
              </motion.div>

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-foreground">Student Reviews</h2>
                {reviews.map((review, index) => (
                  <ReviewCard key={index} {...review} />
                ))}
              </motion.div>

              {/* FAQ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="mb-4 text-xl font-bold text-foreground">Frequently Asked Questions</h2>
                <FAQAccordion items={faqs} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-24 rounded-[20px] bg-card p-6 shadow-lg"
              >
                {/* Preview Image */}
                <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={courseData.image}
                    alt={courseData.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Button size="lg" className="rounded-full">
                      <Play className="mr-2 h-5 w-5" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-foreground">{formatBdt(courseData.price)}</span>
                    <span className="text-lg text-muted-foreground line-through">{formatBdt(courseData.originalPrice)}</span>
                    <Badge className="bg-accent text-accent-foreground">{courseData.discount}% OFF</Badge>
                  </div>
                </div>

                {/* Batch Info */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Batch</span>
                    <span className="font-medium">{courseData.batch}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
                    <span className="text-sm text-accent">Seats Left</span>
                    <span className="font-medium text-accent">{courseData.seatsLeft}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                    <span className="text-sm text-primary">Starts</span>
                    <span className="font-medium text-primary">{courseData.startDate}</span>
                  </div>
                </div>

                {/* CTA */}
                <Button className="mb-3 w-full rounded-xl text-lg" size="lg">
                  Enroll Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="w-full rounded-xl" size="lg">
                  Add to Wishlist
                </Button>

                {/* Course Includes */}
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-foreground">This course includes:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      <span>{courseData.duration} on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      <span>18-hour live support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
