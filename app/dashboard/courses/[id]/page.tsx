"use client"

import { useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoModal } from "@/components/video-modal"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Download,
  Calendar,
  Users,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Video,
} from "lucide-react"

// Course data
const courseData = {
  id: "1",
  title: "Cyber Security & Ethical Hacking: Career Starter",
  batch: "Batch 1",
  status: "Finished",
  progress: 45,
  totalLessons: 24,
  completedLessons: 11,
  instructor: {
    name: "Mohammad Asem Rashed",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  modules: [
    {
      id: "1",
      title: "Module 1 - Cyber Security Basics",
      totalVideos: 2,
      isExpanded: true,
      lessons: [
        {
          id: "1-1",
          title: "Practical Awareness + Career Roadmap",
          duration: "1:51 Hours",
          scheduledDate: "16th Feb, 9:00 PM",
          status: "completed",
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        },
        {
          id: "1-2",
          title: "Cyber Security Basics + Mindset",
          duration: "2:13 Hours",
          scheduledDate: "15th Feb, 9:00 PM",
          status: "current",
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        },
      ],
    },
    {
      id: "2",
      title: "Module 2 - Network Security Fundamentals",
      totalVideos: 4,
      isExpanded: false,
      lessons: [
        {
          id: "2-1",
          title: "Understanding Network Protocols",
          duration: "1:45 Hours",
          scheduledDate: "20th Feb, 9:00 PM",
          status: "upcoming",
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        },
        {
          id: "2-2",
          title: "TCP/IP Deep Dive",
          duration: "2:00 Hours",
          scheduledDate: "22nd Feb, 9:00 PM",
          status: "upcoming",
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        },
        {
          id: "2-3",
          title: "Firewall Configuration Basics",
          duration: "1:30 Hours",
          scheduledDate: "24th Feb, 9:00 PM",
          status: "upcoming",
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        },
        {
          id: "2-4",
          title: "VPN and Secure Connections",
          duration: "1:45 Hours",
          scheduledDate: "26th Feb, 9:00 PM",
          status: "upcoming",
          videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        },
      ],
    },
    {
      id: "3",
      title: "Module 3 - Ethical Hacking Techniques",
      totalVideos: 5,
      isExpanded: false,
      lessons: [
        {
          id: "3-1",
          title: "Introduction to Penetration Testing",
          duration: "2:00 Hours",
          scheduledDate: "1st Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
        {
          id: "3-2",
          title: "Reconnaissance and Footprinting",
          duration: "1:50 Hours",
          scheduledDate: "3rd Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
        {
          id: "3-3",
          title: "Vulnerability Assessment",
          duration: "2:15 Hours",
          scheduledDate: "5th Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
        {
          id: "3-4",
          title: "Exploitation Techniques",
          duration: "2:30 Hours",
          scheduledDate: "7th Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
        {
          id: "3-5",
          title: "Post Exploitation & Reporting",
          duration: "1:45 Hours",
          scheduledDate: "9th Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
      ],
    },
    {
      id: "4",
      title: "Module 4 - Security Tools & Frameworks",
      totalVideos: 3,
      isExpanded: false,
      lessons: [
        {
          id: "4-1",
          title: "Kali Linux Setup & Tools Overview",
          duration: "2:00 Hours",
          scheduledDate: "12th Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
        {
          id: "4-2",
          title: "Wireshark & Network Analysis",
          duration: "1:45 Hours",
          scheduledDate: "14th Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
        {
          id: "4-3",
          title: "Metasploit Framework Basics",
          duration: "2:15 Hours",
          scheduledDate: "16th Mar, 9:00 PM",
          status: "locked",
          videoUrl: "",
        },
      ],
    },
  ],
  resources: [
    {
      id: "1",
      title: "1st Class resource",
      type: "pdf",
      icon: "📄",
    },
    {
      id: "2",
      title: "1st Class resource",
      type: "pdf",
      icon: "📄",
    },
    {
      id: "3",
      title: "Practical Awareness & Career Roadmap",
      type: "pdf",
      icon: "📄",
    },
  ],
}

const leaderboardData = [
  { rank: 1, name: "Mohammad Asem Rashed", score: 1390, progress: 100, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { rank: 2, name: "Student 2", score: 0, progress: 0, avatar: null },
  { rank: 3, name: "Student 3", score: 0, progress: 0, avatar: null },
  { rank: 4, name: "Student 4", score: 0, progress: 0, avatar: null },
  { rank: 5, name: "Student 5", score: 0, progress: 0, avatar: null },
]

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [expandedModules, setExpandedModules] = useState<string[]>(["1"])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("modules")
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean
    videoUrl: string
    title: string
    duration: string
  }>({
    isOpen: false,
    videoUrl: "",
    title: "",
    duration: "",
  })

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const openVideoModal = (lesson: typeof courseData.modules[0]["lessons"][0]) => {
    if (lesson.status !== "locked" && lesson.videoUrl) {
      setVideoModal({
        isOpen: true,
        videoUrl: lesson.videoUrl,
        title: lesson.title,
        duration: lesson.duration,
      })
    }
  }

  const closeVideoModal = () => {
    setVideoModal((prev) => ({ ...prev, isOpen: false }))
  }

  const filteredModules = courseData.modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.lessons.some((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  return (
    <div className="p-6 md:p-8">
      {/* Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={closeVideoModal}
        videoUrl={videoModal.videoUrl}
        title={videoModal.title}
        duration={videoModal.duration}
      />

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/courses" className="hover:text-foreground">My Courses</Link>
        <span>/</span>
        <span className="text-foreground">{courseData.title}</span>
      </div>

      {/* Course Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
            <Image
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop"
              alt={courseData.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl">
              {courseData.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{courseData.batch}</Badge>
              <Badge className="bg-green-100 text-green-700">{courseData.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            <MessageCircle className="mr-2 h-4 w-4" />
            Join WhatsApp
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Users className="mr-2 h-4 w-4" />
            Join Facebook
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start rounded-xl bg-muted p-1">
              <TabsTrigger value="modules" className="rounded-lg">Modules</TabsTrigger>
              <TabsTrigger value="recordings" className="rounded-lg">Recordings</TabsTrigger>
              <TabsTrigger value="resources" className="rounded-lg">Resources</TabsTrigger>
              <TabsTrigger value="certificate" className="rounded-lg">Certificate</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              {/* Module List */}
              {filteredModules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-[20px] border border-border bg-card"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.totalVideos} videos
                      </p>
                    </div>
                    {expandedModules.includes(module.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Lessons Table */}
                  <AnimatePresence>
                    {expandedModules.includes(module.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border">
                          {/* Table Header */}
                          <div className="grid grid-cols-12 gap-4 bg-muted/50 px-5 py-3 text-sm font-medium text-muted-foreground">
                            <div className="col-span-5">Title</div>
                            <div className="col-span-2">Duration</div>
                            <div className="col-span-3">Schedule</div>
                            <div className="col-span-2 text-right">Action</div>
                          </div>
                          
                          {/* Lessons */}
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`grid grid-cols-12 gap-4 items-center border-t border-border px-5 py-4 transition-colors hover:bg-muted/30 ${
                                lesson.status === "current" ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className="col-span-5 flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    lesson.status === "completed"
                                      ? "bg-green-100 text-green-600"
                                      : lesson.status === "current"
                                      ? "bg-primary/20 text-primary"
                                      : lesson.status === "locked"
                                      ? "bg-muted text-muted-foreground"
                                      : "bg-blue-100 text-blue-600"
                                  }`}
                                >
                                  {lesson.status === "completed" ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : lesson.status === "locked" ? (
                                    <Lock className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-foreground line-clamp-2">
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="col-span-2 text-sm text-muted-foreground">
                                {lesson.duration}
                              </div>
                              <div className="col-span-3 text-sm text-muted-foreground">
                                {lesson.scheduledDate}
                              </div>
                              <div className="col-span-2 text-right">
                                <Button
                                  size="sm"
                                  variant={lesson.status === "locked" ? "outline" : "default"}
                                  className="rounded-xl"
                                  onClick={() => openVideoModal(lesson)}
                                  disabled={lesson.status === "locked"}
                                >
                                  {lesson.status === "locked" ? (
                                    <Lock className="h-4 w-4" />
                                  ) : (
                                    <>
                                      <Play className="mr-1 h-3 w-3" />
                                      Watch
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="recordings" className="space-y-4">
              <div className="rounded-[20px] border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">All Recordings</h3>
                <div className="space-y-3">
                  {courseData.modules.flatMap((module) =>
                    module.lessons
                      .filter((lesson) => lesson.status === "completed" || lesson.status === "current")
                      .map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between rounded-xl bg-muted/50 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Video className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{lesson.title}</p>
                              <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => openVideoModal(lesson)}
                          >
                            <Play className="mr-1 h-3 w-3" />
                            Watch
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="rounded-[20px] border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Module 1 Resources</h3>
                <div className="space-y-3">
                  {courseData.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between rounded-xl bg-muted/50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{resource.icon}</span>
                        <span className="font-medium text-foreground">{resource.title}</span>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Eye className="mr-2 h-4 w-4" />
                        Check
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="certificate" className="space-y-4">
              <div className="rounded-[20px] border border-border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Certificate Not Available Yet</h3>
                <p className="text-muted-foreground">
                  Complete all modules and assignments to earn your certificate.
                </p>
                <div className="mt-4">
                  <Progress value={courseData.progress} className="h-2" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {courseData.progress}% completed
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Links */}
          <div className="rounded-[20px] border border-border bg-card p-5">
            <h3 className="mb-4 font-semibold text-foreground">Join Private Group</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl border-green-500 text-green-600 hover:bg-green-50">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="outline" className="rounded-xl border-blue-500 text-blue-600 hover:bg-blue-50">
                <Users className="mr-2 h-4 w-4" />
                Facebook
              </Button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-[20px] border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Leaderboard</h3>
              <Link href="#" className="text-sm text-primary hover:underline">
                See All
              </Link>
            </div>
            <div className="space-y-3">
              {leaderboardData.map((student, index) => (
                <div
                  key={student.rank}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    index === 0
                      ? "bg-amber-50"
                      : index === 1
                      ? "bg-green-50"
                      : index === 2
                      ? "bg-red-50"
                      : "bg-muted/50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-amber-500 text-white"
                        : index === 1
                        ? "bg-green-500 text-white"
                        : index === 2
                        ? "bg-red-500 text-white"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {student.rank}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {student.avatar ? (
                      <Image
                        src={student.avatar}
                        alt={student.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {student.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{student.score} points</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{student.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="rounded-[20px] border border-border bg-card p-5">
            <Button variant="outline" className="w-full rounded-xl">
              <MessageCircle className="mr-2 h-4 w-4" />
              Having Issues?
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
