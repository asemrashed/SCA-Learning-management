import { CertificateIssueForm } from "@/features/certificate/components/certificate-issue-form"

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="mt-2 text-muted-foreground">
          Issue completion certificates for finished enrollments.
        </p>
      </div>
      <CertificateIssueForm />
    </div>
  )
}
