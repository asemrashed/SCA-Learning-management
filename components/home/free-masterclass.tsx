"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Calendar,
  Code,
  Briefcase,
  TrendingUp,
  Database,
  Palette,
  Grid3X3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryNav } from "@/components/home/category-nav"
import { motion } from "framer-motion"

const categories = [
  { id: "all", label: "All", icon: Grid3X3, subtitle: "12 Masterclasses" },
  { id: "web", label: "Web & App Development", icon: Code, subtitle: "4 Masterclasses" },
  { id: "product", label: "Product Management & Design", icon: Briefcase, subtitle: "2 Masterclasses" },
  { id: "business", label: "Business & Marketing", icon: TrendingUp, subtitle: "3 Masterclasses" },
  { id: "data", label: "Data Engineering", icon: Database, subtitle: "2 Masterclasses" },
  { id: "creative", label: "Creatives", icon: Palette, subtitle: "1 Masterclass" },
]

const masterclasses = [
  {
    id: "1",
    title: "Want to Lead in UX? Start Thinking Like a Product Owner",
    course: "UI UX Design Career Track Program",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=250&fit=crop",
    date: "Wednesday, Aug 6, 9:00 PM",
    categoryId: "creative",
    isLive: true,
  },
  {
    id: "2",
    title: "From Zero to Deployed: Master MERN Step by Step",
    course: "Full Stack Web Development with JavaScript (MERN)",
    image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=250&fit=crop",
    date: "Wednesday, Aug 6, 9:00 PM",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "3",
    title: "Plan Smart, Learn Smarter: Your Guide to Data Science",
    course: "Data Science & Machine Learning with Python",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    date: "Wednesday, Aug 6, 9:00 PM",
    categoryId: "data",
    isLive: true,
  },
  {
    id: "4",
    title: "Remote ASP.Net Core Jobs: What Skills You Really Need in 2025",
    course: "Full Stack Web Development with ASP.Net Core",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    date: "Wednesday, Aug 6, 9:00 PM",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "5",
    title: "Growth Marketing Secrets for Startups",
    course: "Digital Marketing Bootcamp",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop",
    date: "Friday, Aug 8, 8:00 PM",
    categoryId: "business",
    isLive: true,
  },
  {
    id: "6",
    title: "Product Roadmaps That Actually Work",
    course: "Product Management Masterclass",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    date: "Saturday, Aug 9, 7:00 PM",
    categoryId: "product",
    isLive: true,
  },
  {
    id: "7",
    title: "Flutter for Beginners: Build Your First App",
    course: "App Development with Flutter",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    date: "Sunday, Aug 10, 9:00 PM",
    categoryId: "web",
    isLive: true,
  },
  {
    id: "8",
    title: "SEO Fundamentals for Business Owners",
    course: "Business & Marketing Essentials",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    date: "Monday, Aug 11, 8:30 PM",
    categoryId: "business",
    isLive: true,
  },
]

export function FreeMasterclass() {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredMasterclasses = useMemo(
    () =>
      activeCategory === "all"
        ? masterclasses
        : masterclasses.filter((mc) => mc.categoryId === activeCategory),
    [activeCategory]
  )

  return (
    <section className="bg-foreground py-20 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Badge className="rounded-full bg-destructive px-4 py-1 text-white">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
              LIVE
            </Badge>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
            Free Live Masterclass
          </h2>
          <p className="mx-auto max-w-2xl text-white/70">
            Join our free live sessions to learn from industry experts
          </p>
        </motion.div>

        <CategoryNav
          items={categories}
          activeId={activeCategory}
          onChange={setActiveCategory}
          variant="on-dark"
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredMasterclasses.map((mc, index) => (
            <motion.div
              key={mc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={mc.image}
                  alt={mc.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {mc.isLive && (
                  <Badge className="absolute left-3 top-3 bg-white text-foreground shadow-sm">
                    <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-destructive" />
                    Live
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <p className="mb-1 line-clamp-1 text-xs text-muted-foreground">
                  {mc.course}
                </p>
                <h3 className="mb-3 min-h-[48px] line-clamp-2 font-semibold text-foreground">
                  {mc.title}
                </h3>
                <div className="mb-4 flex items-center gap-1 text-xs text-destructive">
                  <Calendar className="h-3 w-3" />
                  <span>{mc.date}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-border bg-muted/50 text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white hover:text-foreground"
            asChild
          >
            <Link href="/masterclass">
              View All Masterclasses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
