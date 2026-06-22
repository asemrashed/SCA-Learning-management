import { BackButton } from "@/components/back-button"

interface ComingSoonPageProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
}

export function ComingSoonPage({
  title,
  description = "This section is coming soon. Check back after the next release.",
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
}: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center md:p-8">
      <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
      <p className="mb-8 max-w-md text-muted-foreground">{description}</p>
      <BackButton href={backHref} label={backLabel} />
    </div>
  )
}
