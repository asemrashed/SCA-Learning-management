import type { Metadata } from 'next'
import { Inter, Noto_Sans_Bengali } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { BRAND_NAME, BRAND_LOGO_SRC } from '@/lib/brand'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: `${BRAND_NAME} - Master New Skills`,
  description: 'Premium learning platform with live courses, expert instructors, and career support',
  icons: {
    icon: BRAND_LOGO_SRC,
    apple: BRAND_LOGO_SRC,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansBengali.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
