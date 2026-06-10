"use client"

import Image from "next/image"
import { Download, Smartphone, Monitor, Apple } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BRAND_NAME } from "@/lib/brand"

export function AppDownloadSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-accent py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute h-96 w-96 -translate-x-1/2 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 rounded-full bg-white blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="overflow-hidden rounded-[32px] bg-card p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Download the {BRAND_NAME} App
              </h2>
              <p className="mb-8 text-muted-foreground">
                Get the best learning experience with our mobile app. Access courses offline, 
                track your progress, and learn on the go.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  Android
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                >
                  <Apple className="mr-2 h-5 w-5" />
                  iOS / macOS
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                >
                  <Monitor className="mr-2 h-5 w-5" />
                  Windows
                </Button>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative h-64 w-full max-w-sm md:h-80">
                <Image
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop"
                  alt={`${BRAND_NAME} App`}
                  fill
                  className="rounded-[20px] object-cover shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
