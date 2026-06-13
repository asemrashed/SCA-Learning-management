"use client"

import Image from "next/image"
import {
  buildCertificateBody,
  CERTIFICATE_DIRECTOR,
  formatCertificateDate,
} from "@/features/certificate/lib/certificate-copy"

export interface CertificateViewData {
  studentName: string
  productTitle: string
  issuedAt: string
  serial?: string
  directorName?: string
}

export function CertificateView({
  data,
  className = "",
}: {
  data: CertificateViewData
  className?: string
}) {
  const body = buildCertificateBody(data.studentName, data.productTitle)
  const dateLabel = formatCertificateDate(data.issuedAt)
  const director = data.directorName ?? CERTIFICATE_DIRECTOR

  return (
    <div
      className={`relative mx-auto aspect-[842/595] w-full max-w-4xl overflow-hidden rounded-lg shadow-lg ${className}`}
    >
      <Image
        src="/images/certificate-template.png"
        alt="Certificate of achievement"
        fill
        className="object-contain"
        priority
      />

      <div className="pointer-events-none absolute inset-0 text-[#1a1a1a]">
        <p
          className="absolute left-1/2 top-[50%] w-[78%] -translate-x-1/2 -translate-y-1/2 text-center font-serif text-[clamp(1.25rem,3.2vw,2rem)] italic leading-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {data.studentName}
        </p>

        <p
          className="absolute left-1/2 top-[62%] w-[72%] -translate-x-1/2 text-center font-serif text-[clamp(0.55rem,1.1vw,0.85rem)] leading-relaxed text-[#262626]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {body}
        </p>

        <div className="absolute bottom-[11%] left-[12%] text-center">
          <p className="font-serif text-[clamp(0.55rem,1vw,0.8rem)]">{dateLabel}</p>
          <p className="mt-1 font-serif text-[clamp(0.5rem,0.85vw,0.7rem)] text-[#444]">Date</p>
        </div>

        <div className="absolute bottom-[11%] right-[12%] text-center">
          <p
            className="font-serif text-[clamp(0.7rem,1.2vw,0.95rem)] italic"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {director}
          </p>
          <p className="mt-1 font-serif text-[clamp(0.5rem,0.85vw,0.7rem)] text-[#444]">Signature</p>
        </div>

        {data.serial ? (
          <p className="absolute bottom-[4%] left-1/2 -translate-x-1/2 font-serif text-[clamp(0.45rem,0.75vw,0.65rem)] font-semibold tracking-wide text-[#555]">
            Serial: {data.serial}
          </p>
        ) : null}
      </div>
    </div>
  )
}
