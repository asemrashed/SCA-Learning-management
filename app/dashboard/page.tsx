"use client"

import Link from "next/link"
import Image from "next/image"
import { ProgressCard } from "@/components/progress-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Calendar,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Bell,
  Info,
} from "lucide-react"
import { motion } from "framer-motion"

const enrolledCourses = [
  {
    id: "1",
    title: "Cyber Security & Ethical Hacking: Career Starter",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
    progress: 45,
    totalLessons: 24,
    completedLessons: 11,
    nextLesson: "Network Security Basics",
    lastAccessed: "2 hours ago",
  },
  {
    id: "2",
    title: "DevOps Workshop for Absolute Beginners",
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop",
    progress: 20,
    totalLessons: 18,
    completedLessons: 4,
    nextLesson: "Docker Fundamentals",
    lastAccessed: "1 day ago",
  },
  {
    id: "3",
    title: "Ethical Journalism 101",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
    progress: 0,
    totalLessons: 12,
    completedLessons: 0,
    nextLesson: "Introduction to Journalism",
    lastAccessed: "Not started",
  },
]

const upcomingClasses = [
  {
    id: "1",
    title: "Network Security Deep Dive",
    course: "Cyber Security & Ethical Hacking",
    date: "Today",
    time: "9:00 PM",
    instructor: "Ahmed Rahman",
  },
  {
    id: "2",
    title: "Container Orchestration with Kubernetes",
    course: "DevOps Workshop",
    date: "Tomorrow",
    time: "8:00 PM",
    instructor: "Sarah Chen",
  },
]

const recentActivity = [
  {
    type: "completed",
    title: "Completed: Introduction to Cyber Security",
    time: "2 hours ago",
  },
  {
    type: "started",
    title: "Started: Network Security Basics",
    time: "2 hours ago",
  },
  {
    type: "certificate",
    title: "Earned: Python Fundamentals Certificate",
    time: "1 day ago",
  },
  {
    type: "enrolled",
    title: "Enrolled in: Ethical Journalism 101",
    time: "3 days ago",
  },
]

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Welcome back, Mohammad!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey where you left off.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="relative rounded-xl">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
              3
            </span>
          </Button>
          <Button className="rounded-xl">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-[20px] bg-gradient-to-r from-primary/20 to-brand-category border border-primary/30 p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-secondary">No Live Class Today</p>
            <p className="text-sm text-secondary/80">
              Practice your previous lessons and assignments while waiting for the next class.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[20px] bg-primary/25 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/40">
              <BookOpen className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">3</p>
              <p className="text-sm text-secondary/80">Enrolled Courses</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[20px] bg-brand-category p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/40">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">15</p>
              <p className="text-sm text-secondary/80">Completed Lessons</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[20px] bg-primary/40 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Award className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">2</p>
              <p className="text-sm text-secondary/80">Certificates Earned</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[20px] bg-secondary/10 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/30">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">22%</p>
              <p className="text-sm text-secondary/80">Overall Progress</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">My Courses</h2>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="rounded-xl">
                  All Courses
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Ongoing
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <ProgressCard key={course.id} {...course} />
              ))}
            </div>
          </motion.div>

          {/* Learning Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[20px] bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-xl font-bold text-foreground">Learning Analytics</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Weekly Study Time</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">12.5</span>
                  <span className="text-muted-foreground">hours</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {[40, 60, 30, 80, 50, 70, 45].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/20"
                      style={{ height: `${height}px` }}
                    >
                      <div
                        className="w-full rounded-t bg-primary"
                        style={{ height: `${height * 0.6}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Cyber Security</span>
                    <span className="text-primary">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>DevOps Workshop</span>
                    <span className="text-primary">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Journalism 101</span>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Classes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[20px] bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-foreground">Upcoming Classes</h2>
            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-xl bg-muted/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{cls.title}</h3>
                      <p className="text-xs text-muted-foreground">{cls.course}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {cls.date}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cls.time}
                    </span>
                    <span>{cls.instructor}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full rounded-xl">
              View Calendar
              <Calendar className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-[20px] bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-foreground">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      activity.type === "completed"
                        ? "bg-green-100 text-green-600"
                        : activity.type === "started"
                        ? "bg-blue-100 text-blue-600"
                        : activity.type === "certificate"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {activity.type === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : activity.type === "started" ? (
                      <Play className="h-4 w-4" />
                    ) : activity.type === "certificate" ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
