import Image from "next/image"
import Link from "next/link"
import { BookOpen, ShieldCheck, Trophy, Users, CheckCircle, GraduationCap } from "lucide-react"

export const metadata = {
  title: "About Us | Sharif Commerce Academy",
  description: "Learn about Sharif Commerce Academy (SCA), our mission, vision, and core values. Discover how we empower commerce students to achieve academic and professional success.",
}

const stats = [
  { value: "5,000+", label: "Successful Students" },
  { value: "15+", label: "Expert Instructors" },
  { value: "98%", label: "Success Rate" },
  { value: "8+", label: "Years of Excellence" },
]

const values = [
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "We provide comprehensive, high-quality study materials and teaching methods to ensure top academic results.",
  },
  {
    icon: ShieldCheck,
    title: "Uncompromised Integrity",
    description: "We believe in transparency, honesty, and ethical coaching principles to guide our students.",
  },
  {
    icon: Trophy,
    title: "Student-Centric Success",
    description: "Every student is unique. We provide tailored support, doubt-solving sessions, and mentorship to nurture success.",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description: "Learn from industry professionals and academic toppers who bring practical insights into commerce studies.",
  },
]

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
        <div className="container mx-auto px-4 text-center relative z-10">
          <nav className="mb-4 flex justify-center space-x-2 text-sm text-secondary-foreground/60">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-secondary-foreground">About Us</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            About Sharif Commerce Academy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary-foreground/80">
            Empowering the next generation of business leaders and financial experts with premier commerce coaching.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Image side */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative">
                <div className="absolute -left-4 -top-4 h-72 w-72 rounded-3xl bg-primary/20" />
                <div className="absolute -right-4 -bottom-4 h-72 w-72 rounded-3xl bg-brand-category/40" />
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80"
                    alt="SCA classroom study session"
                    width={800}
                    height={600}
                    className="h-[450px] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider text-secondary dark:text-primary">
                  Who We Are
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A Legacy of Excellence in Commerce Education
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Sharif Commerce Academy (SCA) has been at the forefront of providing premier coaching and academic mentorship for commerce students. We cater to university-level academic courses, professional training, and foundation builds in accounting, finance, management, and marketing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our blended approach combines detailed classroom lectures, online interactive courses, structured assignments, and live exam preparations. This comprehensive system has enabled thousands of our students to excel in their academic results and transition smoothly into successful corporate careers.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Conceptual Clearances",
                  "Regular Exam Mockups",
                  "Structured Assignments",
                  "Dedicated Doubt Classes",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-3xl font-extrabold text-secondary dark:text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-primary/10" />
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-secondary dark:text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To democratize high-quality commerce education by providing accessible, structured, and result-oriented academic and professional guidance. We strive to simplify complex business concepts and inspire students to reach their full potential.
              </p>
            </div>

            {/* Vision */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-brand-category/30" />
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-category/50 text-secondary">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the country's most trusted and leading commerce academy, recognized for academic innovation, student-centric pedagogy, and producing outstanding finance and business leaders of tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-muted/50 py-16 md:py-24 border-t border-b border-border">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Values That Drive Us
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our culture and educational philosophy are built upon a foundation of core values that guide our teaching and interaction with students.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((val) => {
              const Icon = val.icon
              return (
                <div
                  key={val.title}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/25 text-secondary dark:text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-foreground">{val.title}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{val.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
