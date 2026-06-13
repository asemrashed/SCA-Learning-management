"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIssueCertificateMutation } from "@/features/certificate/api"
import { CertificateView } from "@/features/certificate/components/certificate-view"
import { getApiErrorMessage } from "@/lib/get-api-error-message"

export function CertificateIssueForm() {
  const [enrollmentId, setEnrollmentId] = useState("")
  const [issueCertificate, { isLoading }] = useIssueCertificateMutation()
  const [error, setError] = useState<string | null>(null)
  const [issued, setIssued] = useState<{
    studentName: string
    productTitle: string
    issuedAt: string
    serial: string
    pdfUrl: string | null
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIssued(null)
    try {
      const result = await issueCertificate({ enrollmentId: enrollmentId.trim() }).unwrap()
      setIssued({
        studentName: result.data.studentName,
        productTitle: result.data.productTitle,
        issuedAt: result.data.issuedAt,
        serial: result.data.serial,
        pdfUrl: result.data.pdfUrl,
      })
      setEnrollmentId("")
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not issue certificate."))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <h3 className="text-lg font-semibold">Issue certificate</h3>
          <p className="text-sm text-muted-foreground">
            Enter a completed enrollment ID. The student must have finished all lessons.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="enrollment-id">Enrollment ID</Label>
            <Input
              id="enrollment-id"
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              placeholder="Enrollment cuid…"
              required
            />
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={isLoading} className="rounded-xl">
          {isLoading ? "Issuing…" : "Issue certificate"}
        </Button>
      </form>

      {issued ? (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-medium text-green-700">Certificate issued</p>
            <p className="text-muted-foreground">
              Serial: <span className="font-mono">{issued.serial}</span>
            </p>
            {issued.pdfUrl ? (
              <Button variant="outline" size="sm" className="mt-3 rounded-xl" asChild>
                <a href={issued.pdfUrl} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </Button>
            ) : null}
          </div>
          <CertificateView data={issued} />
        </div>
      ) : null}
    </div>
  )
}
