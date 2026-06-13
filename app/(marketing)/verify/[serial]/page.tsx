"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVerifyCertificateQuery } from "@/features/certificate/api"
import { CertificateView } from "@/features/certificate/components/certificate-view"

export default function VerifyCertificatePage() {
  const params = useParams<{ serial: string }>()
  const serial = decodeURIComponent(params.serial ?? "")
  const { data, isLoading, isError } = useVerifyCertificateQuery(serial, { skip: !serial })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Certificate verification</h1>
        <p className="mt-2 text-muted-foreground">
          Confirm that a Sharif Commerce Academy certificate is authentic.
        </p>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Verifying…</p>
      ) : isError || !data?.data ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center">
          <p className="font-medium">Certificate not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No valid certificate matches serial{" "}
            <span className="font-mono">{serial || "—"}</span>.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-800">
            Valid certificate · Serial <span className="font-mono">{data.data.serial}</span>
          </div>
          <CertificateView
            data={{
              studentName: data.data.studentName,
              productTitle: data.data.productTitle,
              issuedAt: data.data.issuedAt,
              serial: data.data.serial,
            }}
          />
          {data.data.pdfUrl ? (
            <div className="flex justify-center">
              <Button variant="outline" className="rounded-xl" asChild>
                <a href={data.data.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
