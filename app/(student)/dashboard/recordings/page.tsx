"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { VideoModal } from "@/components/video-modal"
import { motion } from "framer-motion"
import { Play, Search, Calendar, Clock, Filter, Video, Download } from "lucide-react"

const recordings = [
  {
    id: "1",
    title: "Practical Awareness + Career Roadmap",
    course: "Cyber Security & Ethical Hacking",
    module: "Module 1",
    duration: "1:51:57",
    date: "16th Feb, 2024",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=225&fit=crop",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    instructor: "Safwan Hantara",
  },
  {
    id: "2",
    title: "Cyber Security Basics + Mindset",
    course: "Cyber Security & Ethical Hacking",
    module: "Module 1",
    duration: "2:13:45",
    date: "15th Feb, 2024",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    instructor: "Safwan Hantara",
  },
  {
    id: "3",
    title: "Docker Fundamentals",
    course: "DevOps Workshop",
    module: "Module 2",
    duration: "1:45:20",
    date: "12th Feb, 2024",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=225&fit=crop",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    instructor: "Sarah Chen",
  },
  {
    id: "4",
    title: "Introduction to DevOps",
    course: "DevOps Workshop",
    module: "Module 1",
    duration: "1:30:00",
    date: "10th Feb, 2024",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=225&fit=crop",
    videoUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
    instructor: "Sarah Chen",
  },
]

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
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

  const filteredRecordings = recordings.filter(
    (recording) =>
      recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openVideoModal = (recording: typeof recordings[0]) => {
    setVideoModal({
      isOpen: true,
      videoUrl: recording.videoUrl,
      title: recording.title,
      duration: recording.duration,
    })
  }

  const closeVideoModal = () => {
    setVideoModal((prev) => ({ ...prev, isOpen: false }))
  }

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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Recordings</h1>
        <p className="text-muted-foreground">Watch all your past class recordings</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="rounded-xl">
            All Courses
          </Button>
        </div>
      </div>

      {/* Recordings Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecordings.map((recording, index) => (
          <motion.div
            key={recording.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group overflow-hidden rounded-[20px] bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => openVideoModal(recording)}>
              <Image
                src={recording.thumbnail}
                alt={recording.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                </div>
              </div>
              <Badge className="absolute bottom-3 right-3 bg-black/70">
                <Clock className="mr-1 h-3 w-3" />
                {recording.duration}
              </Badge>
            </div>

            {/* Info */}
            <div className="p-5">
              <Badge variant="outline" className="mb-2">
                {recording.course}
              </Badge>
              <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {recording.title}
              </h3>
              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {recording.date}
                </span>
                <span>{recording.module}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => openVideoModal(recording)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecordings.length === 0 && (
        <div className="py-16 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No recordings found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
