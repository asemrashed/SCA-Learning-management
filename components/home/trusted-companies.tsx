"use client"

import Image from "next/image"
import { motion } from "framer-motion"

const companies = [
  { name: "Goldman Sachs", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "JP Morgan", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "Deloitte", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "KPMG", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "EY", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "PwC", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "McKinsey", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
  { name: "BCG", logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=120&h=40&fit=crop" },
]

export function TrustedCompanies() {
  return (
    <section className="border-y border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="mb-6 text-sm font-medium text-muted-foreground">
            Our graduates work at leading financial institutions worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 grayscale opacity-60">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex h-10 items-center"
              >
                <span className="text-lg font-semibold text-foreground/50">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
