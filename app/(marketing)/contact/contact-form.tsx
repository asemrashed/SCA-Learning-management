"use client"

import { useState } from "react"
import { Send, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus("error")
      setErrorMessage("Please fill out all fields.")
      return
    }

    setStatus("loading")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again later.")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-lg min-h-[400px]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-secondary dark:text-primary">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-foreground">Message Sent Successfully!</h3>
        <p className="text-muted-foreground max-w-sm">
          Thank you for reaching out. A representative from Sharif Commerce Academy will get back to you shortly.
        </p>
        <Button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full px-6"
          id="send-another-button"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-lg">
      <h3 className="mb-6 text-xl font-bold text-foreground">Send us a Message</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name-input" className="text-sm font-medium text-foreground">
            Full Name
          </label>
          <Input
            id="name-input"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={status === "loading"}
            className="rounded-xl border-border bg-background focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email-input" className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <Input
            id="email-input"
            name="email"
            type="email"
            placeholder="johndoe@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status === "loading"}
            className="rounded-xl border-border bg-background focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="subject-input" className="text-sm font-medium text-foreground">
            Subject
          </label>
          <Input
            id="subject-input"
            name="subject"
            placeholder="Course Inquiry / Feedback"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={status === "loading"}
            className="rounded-xl border-border bg-background focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message-input" className="text-sm font-medium text-foreground">
            Message
          </label>
          <Textarea
            id="message-input"
            name="message"
            placeholder="Write your message here..."
            value={formData.message}
            onChange={handleChange}
            required
            disabled={status === "loading"}
            rows={5}
            className="rounded-xl border-border bg-background focus-visible:ring-primary min-h-[120px] resize-y"
          />
        </div>

        <Button
          id="submit-button"
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full py-6 text-base font-semibold transition-transform active:scale-98"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Sending...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
