import { redirect } from "next/navigation"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  redirect("/login")
}
