import './globals.css'
import type { Metadata, Viewport } from 'next'
import BrandFooter from '@/components/branding/BrandFooter'

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const viewport: Viewport = {
  themeColor: '#0B1020',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'BRAINBATTLE | Think Fast. Play Smart. Win Big.',
  description: 'BRAINBATTLE is an academic competition and CBT platform where students compete, challenge themselves, and rise to the top.',
  applicationName: 'BRAINBATTLE',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/branding/brainbattle-logo.png', type: 'image/png' }],
    apple: [{ url: '/branding/brainbattle-logo.png', type: 'image/png' }],
  },
  openGraph: {
    title: 'BRAINBATTLE | Think Fast. Play Smart. Win Big.',
    description: 'An academic competition and CBT platform where students compete, challenge themselves, and rise to the top.',
    siteName: 'BRAINBATTLE',
    type: 'website',
    images: [{ url: '/branding/brainbattle-logo.png', width: 768, height: 768, alt: 'BRAINBATTLE — Think fast. Play smart. Win big.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BRAINBATTLE | Think Fast. Play Smart. Win Big.',
    description: 'An academic competition and CBT platform where students compete, challenge themselves, and rise to the top.',
    images: ['/branding/brainbattle-logo.png'],
  },
}
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}<BrandFooter /></body></html>
}
