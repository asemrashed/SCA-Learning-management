"use client"

import Link from "next/link"
import { ExternalLink, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useListMyCertificatesQuery } from "@/features/certificate/api"
import { CertificateView } from "@/features/certificate/components/certificate-view"
import { StudentPageShell } from "@/components/student/student-page-shell"

export default function CertificatesPage() {
  const { data, isLoading, isError } = useListMyCertificatesQuery()
  const certificates = data?.data ?? []

  return (
    <StudentPageShell title="Certificates">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading certificates…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Could not load certificates.</p>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-medium">No certificates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finish all lessons in an enrollment to become eligible.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {certificates.map((cert) => (
            <article key={cert.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{cert.productTitle}</h2>
                  <p className="text-sm text-muted-foreground">
                    {cert.kind === "BATCH" ? "Batch" : "Course"} · Issued{" "}
                    {new Date(cert.issuedAt).toLocaleDateString()} · Serial{" "}
                    <span className="font-mono">{cert.serial}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cert.pdfUrl ? (
                    <Button
                      size="sm"
                      className="rounded-xl bg-secondary text-primary hover:bg-secondary/90"
                      asChild
                    >
                      <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Download PDF
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    className="rounded-xl bg-primary text-secondary hover:bg-primary/90"
                    asChild
                  >
                    <Link href={`/verify/${cert.serial}`}>Verify online</Link>
                  </Button>
                </div>
              </div>
              <CertificateView
                data={{
                  studentName: cert.studentName,
                  productTitle: cert.productTitle,
                  issuedAt: cert.issuedAt,
                  serial: cert.serial,
                }}
              />
            </article>
          ))}
        </div>
      )}
    </StudentPageShell>
  )
}
