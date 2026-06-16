import { redirect } from "next/navigation"

/** Recordings moved into each batch/course player — keep route as redirect for old links. */
export default function RecordingsPage() {
  redirect("/dashboard/courses")
}
