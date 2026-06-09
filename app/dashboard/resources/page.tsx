"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Search, FileText, Download, Eye, Filter, FolderOpen, File, Link2 } from "lucide-react"

const resources = [
  {
    id: "1",
    title: "Cyber Security Fundamentals Guide",
    course: "Cyber Security & Ethical Hacking",
    module: "Module 1",
    type: "pdf",
    size: "2.5 MB",
    addedDate: "16th Feb, 2024",
  },
  {
    id: "2",
    title: "Network Security Cheatsheet",
    course: "Cyber Security & Ethical Hacking",
    module: "Module 2",
    type: "pdf",
    size: "1.2 MB",
    addedDate: "15th Feb, 2024",
  },
  {
    id: "3",
    title: "Practical Awareness & Career Roadmap",
    course: "Cyber Security & Ethical Hacking",
    module: "Module 1",
    type: "pdf",
    size: "3.8 MB",
    addedDate: "14th Feb, 2024",
  },
  {
    id: "4",
    title: "Docker Commands Reference",
    course: "DevOps Workshop",
    module: "Module 2",
    type: "pdf",
    size: "0.8 MB",
    addedDate: "12th Feb, 2024",
  },
  {
    id: "5",
    title: "Kubernetes Deployment Guide",
    course: "DevOps Workshop",
    module: "Module 3",
    type: "link",
    size: "External",
    addedDate: "10th Feb, 2024",
  },
  {
    id: "6",
    title: "DevOps Best Practices",
    course: "DevOps Workshop",
    module: "Module 1",
    type: "pdf",
    size: "4.2 MB",
    addedDate: "8th Feb, 2024",
  },
]

const resourcesByModule = [
  {
    course: "Cyber Security & Ethical Hacking",
    modules: [
      {
        name: "Module 1",
        resources: resources.filter(r => r.course === "Cyber Security & Ethical Hacking" && r.module === "Module 1"),
      },
      {
        name: "Module 2",
        resources: resources.filter(r => r.course === "Cyber Security & Ethical Hacking" && r.module === "Module 2"),
      },
    ],
  },
  {
    course: "DevOps Workshop",
    modules: [
      {
        name: "Module 1",
        resources: resources.filter(r => r.course === "DevOps Workshop" && r.module === "Module 1"),
      },
      {
        name: "Module 2",
        resources: resources.filter(r => r.course === "DevOps Workshop" && r.module === "Module 2"),
      },
      {
        name: "Module 3",
        resources: resources.filter(r => r.course === "DevOps Workshop" && r.module === "Module 3"),
      },
    ],
  },
]

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped")

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Resources</h1>
        <p className="text-muted-foreground">Access all course materials and downloads</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grouped" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setViewMode("grouped")}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            By Module
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setViewMode("list")}
          >
            <File className="mr-2 h-4 w-4" />
            All Files
          </Button>
        </div>
      </div>

      {viewMode === "grouped" ? (
        /* Grouped View */
        <div className="space-y-8">
          {resourcesByModule.map((courseGroup, courseIndex) => (
            <motion.div
              key={courseGroup.course}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: courseIndex * 0.1 }}
            >
              <h2 className="mb-4 text-lg font-semibold text-foreground">{courseGroup.course}</h2>
              <div className="space-y-4">
                {courseGroup.modules.map((module) => (
                  <div
                    key={module.name}
                    className="rounded-[20px] border border-border bg-card overflow-hidden"
                  >
                    <div className="bg-muted/50 px-5 py-3">
                      <h3 className="font-medium text-foreground">{module.name} Resources</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {module.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              resource.type === "pdf" ? "bg-red-100" : "bg-blue-100"
                            }`}>
                              {resource.type === "pdf" ? (
                                <FileText className="h-5 w-5 text-red-600" />
                              ) : (
                                <Link2 className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{resource.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {resource.size} • Added {resource.addedDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            {resource.type === "pdf" && (
                              <Button variant="outline" size="icon" className="rounded-xl">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {module.resources.length === 0 && (
                        <div className="px-5 py-8 text-center text-muted-foreground">
                          No resources available for this module yet.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-[20px] border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-muted/50 px-5 py-3 text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Course</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    resource.type === "pdf" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    {resource.type === "pdf" ? (
                      <FileText className="h-5 w-5 text-red-600" />
                    ) : (
                      <Link2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{resource.title}</p>
                    <p className="text-sm text-muted-foreground">{resource.module}</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <Badge variant="outline">{resource.course}</Badge>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {resource.size}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {resource.type === "pdf" && (
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filteredResources.length === 0 && (
        <div className="py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No resources found</h3>
          <p className="text-muted-foreground">Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}
