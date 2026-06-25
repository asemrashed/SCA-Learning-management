import Image from "next/image"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  MapPin,
  MessageCircle,
  Rocket,
  Target,
  Trophy,
} from "lucide-react"
import {
  BRAND_NAME,
  BRAND_PHONE,
  BRAND_SUBTAGLINE,
  BRAND_TAGLINE,
} from "@/lib/brand"

export const metadata = {
  title: "About Us | Sharif Commerce Academy",
  description:
    "Learn about Sharif Commerce Academy — Bangladesh's trusted online learning platform for BBA and MBA students. Discover our mission, vision, programs, and commitment to academic excellence.",
}

const missionCommitments = [
  "Complex topics সহজ ও structured way-তে শেখাতে",
  "Concept-based learning নিশ্চিত করতে",
  "Exam-focused preparation-এর মাধ্যমে better results আনতে",
  "Affordable কিন্তু premium quality education প্রদান করতে",
]

const differentiators = [
  "High-Quality Live & Recorded Classes",
  "Professionally Structured Lecture Sheets",
  "Detailed Solution PDF & Practice Support",
  "Exam-Centered Suggestion & Revision",
  "Interactive Learning Experience",
  "Dedicated Student Support System",
  "Flexible Learning — Anytime, Anywhere",
]

const academicPrograms = [
  "BBA 1st Year Full Course",
  "BBA 2nd Year Full Course",
  "BBA 3rd Year Full Course",
  "BBA 4th Year Full Course",
  "MBA Final Year Full Course",
  "Single Subject Premium Recorded Course",
  "Accounting Special Programs",
  "Math & Analytical Subjects",
  "Final Revision & Exam Preparation Batch",
]

const excellencePoints = [
  "Better Understanding",
  "Stronger Concepts",
  "Higher Confidence",
  "Outstanding Academic Performance",
]

const whatsappHref = `https://wa.me/880${BRAND_PHONE.replace(/\D/g, "").replace(/^0/, "")}`

function SectionLabel({
  children,
  centered = false,
}: {
  children: React.ReactNode
  centered?: boolean
}) {
  return (
    <div className={`mb-3 flex items-center gap-2 ${centered ? "justify-center" : ""}`}>
      <span className="h-2 w-2 rounded-full bg-primary" />
      <span className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-primary">
        {children}
      </span>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-secondary py-16 md:py-24 text-secondary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q15 15 30 30 T60 30' fill='none' stroke='%2371d4cb' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <nav className="mb-4 flex justify-center space-x-2 text-sm text-secondary-foreground/60">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-secondary-foreground">About Us</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            About Us
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-secondary-foreground/80">
            Empowering Future Business Leaders Through Quality Education
          </p>
        </div>
      </section>

      {/* About Us Intro */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                <Image
                  src="/about.jpeg"
                  alt="Md. Shariful Islam, Academic Director — Sharif Commerce Academy"
                  width={1200}
                  height={800}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="space-y-6">
              <SectionLabel>About Us</SectionLabel>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Empowering Future Business Leaders Through Quality Education
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-foreground">{BRAND_NAME}</strong> হলো BBA ও
                MBA শিক্ষার্থীদের জন্য একটি আধুনিক, উদ্ভাবনী এবং বিশ্বস্ত{" "}
                <strong className="font-semibold text-foreground">Online Learning Platform</strong>,
                যা commerce education-কে আরও সহজ, কার্যকর এবং ফলপ্রসূ করে তুলতে প্রতিশ্রুতিবদ্ধ।
              </p>
              <p className="leading-relaxed text-muted-foreground">
                বর্তমান প্রতিযোগিতামূলক শিক্ষাব্যবস্থায় শুধুমাত্র পাঠ্যবই নির্ভর শিক্ষা যথেষ্ট নয়।
                সফলতার জন্য প্রয়োজন{" "}
                <strong className="font-semibold text-foreground">
                  conceptual clarity, strategic preparation এবং continuous guidance
                </strong>
                । এই বাস্তবতাকে সামনে রেখেই {BRAND_NAME} প্রতিষ্ঠিত হয়েছে—যেখানে প্রতিটি
                শিক্ষার্থী পায় structured learning, expert support এবং exam-oriented
                preparation-এর সমন্বিত অভিজ্ঞতা।
              </p>
              <p className="leading-relaxed text-muted-foreground">
                আমরা বিশ্বাস করি, শিক্ষা শুধুমাত্র পরীক্ষায় ভালো ফল করার মাধ্যম নয়; বরং এটি
                আত্মবিশ্বাস, দক্ষতা এবং ভবিষ্যৎ নেতৃত্ব তৈরির শক্তিশালী ভিত্তি।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="border-y border-border bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionLabel>Our Journey</SectionLabel>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Journey
          </h2>
          <div className="space-y-5 leading-relaxed text-muted-foreground">
            <p>
              {BRAND_NAME}-এর যাত্রা শুরু হয় একটি স্পষ্ট উদ্দেশ্য নিয়ে—BBA ও MBA শিক্ষার্থীদের জন্য
              এমন একটি নির্ভরযোগ্য learning ecosystem তৈরি করা, যেখানে জটিল Math subject-গুলো
              সহজ, গভীর এবং practical approach-এ শেখানো হবে।
            </p>
            <p>
              অনেক শিক্ষার্থী quality guidance, proper resources এবং effective preparation
              strategy-এর অভাবে তাদের পূর্ণ সম্ভাবনা কাজে লাগাতে পারে না। এই gap দূর করাই{" "}
              {BRAND_NAME} মূল প্রেরণা।
            </p>
            <p>
              আজ আমরা গর্বিত যে দেশের বিভিন্ন প্রান্তের হাজারো শিক্ষার্থীরা &ldquo;{BRAND_NAME}
              &rdquo; platform-এর মাধ্যমে নিজেদের academic excellence-এর পথে এগিয়ে যাচ্ছে।
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl md:p-10">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/10" />
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-secondary dark:text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Our Mission</h3>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                আমাদের Mission হলো শিক্ষার্থীদের জন্য এমন একটি transformative learning experience
                তৈরি করা, যা তাদের academic performance উন্নত করার পাশাপাশি professional
                confidence-ও বৃদ্ধি করে।
              </p>
              <p className="mb-3 text-sm font-semibold text-foreground">আমরা প্রতিশ্রুতিবদ্ধ—</p>
              <ul className="space-y-2">
                {missionCommitments.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl md:p-10">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-brand-category/30" />
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-category/50 text-secondary">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Our Vision</h3>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                আমাদের Vision হলো{" "}
                <strong className="font-semibold text-foreground">
                  বাংলাদেশের Leading Commerce Education Platform
                </strong>{" "}
                হিসেবে প্রতিষ্ঠিত হওয়া, যেখানে technology-driven learning এবং academic excellence
                একসাথে কাজ করবে।
              </p>
              <p className="leading-relaxed text-muted-foreground">
                আমরা এমন একটি ভবিষ্যৎ কল্পনা করি, যেখানে প্রতিটি শিক্ষার্থী location বা limitation
                ছাড়াই quality education-এর সমান সুযোগ পাবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sharif Commerce Academy */}
      <section className="border-y border-border bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <SectionLabel centered>Why {BRAND_NAME}?</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Makes Us Different?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              আমাদের uniqueness আমাদের teaching methodology-তে।
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {differentiators.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-muted-foreground">
            আমাদের প্রতিটি course এমনভাবে design করা হয় যাতে learning হয় efficient, engaging এবং
            result-driven।
          </p>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <SectionLabel centered>Academic Programs</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Academic Programs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              আমরা BBA ও MBA শিক্ষার্থীদের জন্য carefully designed programs প্রদান করি—
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {academicPrograms.map((program) => (
              <div
                key={program}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-foreground">{program}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment to Excellence */}
      <section className="border-y border-border bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <SectionLabel centered>Our Commitment</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Commitment to Excellence
          </h2>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            {BRAND_NAME}-এ excellence কোনো option নয়—এটি আমাদের standard। আমরা প্রতিটি শিক্ষার্থীর
            learning journey-কে গুরুত্ব দিয়ে নিশ্চিত করি—
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {excellencePoints.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-border bg-card px-6 py-4 shadow-sm"
              >
                <p className="font-semibold text-foreground">{point}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-muted-foreground">
            শিক্ষার্থীদের সফলতা আমাদের passion, commitment এবং inspiration।
          </p>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <SectionLabel>Founder&apos;s Message</SectionLabel>
          <blockquote className="relative rounded-3xl border border-border bg-card p-8 shadow-lg md:p-10">
            <div className="absolute -top-3 left-8 text-6xl font-serif leading-none text-primary/30">
              &ldquo;
            </div>
            <p className="relative text-lg leading-relaxed text-muted-foreground md:text-xl">
              সঠিক guidance, disciplined preparation এবং quality education একজন শিক্ষার্থীর জীবনে
              অসাধারণ পরিবর্তন আনতে পারে। {BRAND_NAME}-এর মাধ্যমে আমরা শুধু পড়াই না—আমরা
              শিক্ষার্থীদের সফলতার জন্য একটি শক্তিশালী foundation তৈরি করি।
            </p>
            <footer className="mt-6 text-sm font-semibold text-foreground">
              — Founder, {BRAND_NAME}
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16 text-secondary-foreground md:py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Begin Your Journey With Us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary-foreground/80">
            আপনার academic excellence-এর পরবর্তী ধাপ শুরু হোক{" "}
            <strong className="font-semibold text-secondary-foreground">{BRAND_NAME}</strong>-এর
            সাথে। আজই যুক্ত হন একটি premium learning community-এর সাথে এবং এগিয়ে যান সফলতার
            পথে।
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp: {BRAND_PHONE}
            </a>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-secondary-foreground/30 px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-foreground/10"
            >
              <Rocket className="h-4 w-4" />
              Explore Courses
            </Link>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-secondary-foreground/70">
            <MapPin className="h-4 w-4" />
            Address: Saver, Dhaka
          </p>

          <p className="mt-8 text-sm font-medium text-primary">
            Learn Smart. Grow Faster. Achieve More.
          </p>

          <div className="mt-10 space-y-2 border-t border-secondary-foreground/20 pt-8">
            <p className="text-secondary-foreground/80">
              &ldquo;{BRAND_NAME} শুধুমাত্র একটি কোচিং নয়, এটি আপনার একাডেমিক সফলতার স্বপ্নপূরণের
              নির্ভরযোগ্য সঙ্গী।&rdquo;
            </p>
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary-foreground">
              <GraduationCap className="h-4 w-4" />
              {BRAND_SUBTAGLINE}
            </p>
            <p className="text-xs text-secondary-foreground/60">{BRAND_TAGLINE}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
