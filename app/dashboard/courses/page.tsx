"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Play, Clock, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react"

const enrolledCourses = [
  {
    id: "1",
    title: "Cyber Security & Ethical Hacking: Career Starter",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
    progress: 45,
    totalLessons: 24,
    completedLessons: 11,
    totalModules: 6,
    completedModules: 2,
    batch: "Batch 1",
    status: "ongoing",
    nextLesson: "Network Security Basics",
    lastAccessed: "2 hours ago",
    instructor: "Ahmed Rahman",
  },
  {
    id: "2",
    title: "DevOps Workshop for Absolute Beginners",
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop",
    progress: 20,
    totalLessons: 18,
    completedLessons: 4,
    totalModules: 4,
    completedModules: 1,
    batch: "Batch 2",
    status: "ongoing",
    nextLesson: "Docker Fundamentals",
    lastAccessed: "1 day ago",
    instructor: "Sarah Chen",
  },
  {
    id: "3",
    title: "Ethical Journalism 101",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
    progress: 0,
    totalLessons: 12,
    completedLessons: 0,
    totalModules: 3,
    completedModules: 0,
    batch: "Batch 1",
    status: "not-started",
    nextLesson: "Introduction to Journalism",
    lastAccessed: "Not started",
    instructor: "Mark Wilson",
  },
  {
    id: "4",
    title: "Full Stack Web Development with Python, Django & React",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
    progress: 100,
    totalLessons: 32,
    completedLessons: 32,
    totalModules: 8,
    completedModules: 8,
    batch: "Batch 5",
    status: "completed",
    nextLesson: null,
    lastAccessed: "2 weeks ago",
    instructor: "Lisa Park",
  },
]

export default function MyCoursesPage() {
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">My Courses</h1>
        <p className="text-muted-foreground">Manage and continue your enrolled courses</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button className="rounded-xl">All Courses</Button>
        <Button variant="outline" className="rounded-xl">Ongoing</Button>
        <Button variant="outline" className="rounded-xl">Completed</Button>
        <Button variant="outline" className="rounded-xl">Not Started</Button>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {enrolledCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group overflow-hidden rounded-[20px] bg-card shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            {/* Course Image */}
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge
                className={`absolute top-3 left-3 ${
                  course.status === "completed"
                    ? "bg-green-500"
                    : course.status === "ongoing"
                    ? "bg-primary"
                    : "bg-amber-500"
                }`}
              >
                {course.status === "completed"
                  ? "Completed"
                  : course.status === "ongoing"
                  ? "Ongoing"
                  : "Not Started"}
              </Badge>
              <div className="absolute bottom-3 left-3 right-3">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {course.batch}
                </Badge>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-5">
              <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Instructor: {course.instructor}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-primary">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {course.completedModules}/{course.totalModules} modules
                </span>
              </div>

              {/* Next Lesson or CTA */}
              {course.nextLesson && (
                <div className="mb-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Next up:</p>
                  <p className="text-sm font-medium text-foreground">{course.nextLesson}</p>
                </div>
              )}

              {/* Action Button */}
              <Link href={`/dashboard/courses/${course.id}`}>
                <Button className="w-full rounded-xl" variant={course.status === "completed" ? "outline" : "default"}>
                  {course.status === "completed" ? (
                    <>
                      Review Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : course.status === "ongoing" ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Course
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
