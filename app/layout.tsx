import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pacifica Intelligence Terminal - AI-Powered Trading Intelligence',
  description: 'Transform raw perpetual futures data into actionable alpha, risk-aware decisions, and automated execution on Pacifica.',
  keywords: ['pacifica', 'trading', 'defi', 'perpetuals', 'ai', 'intelligence', 'alpha', 'risk'],
  authors: [{ name: 'Pacifica Intelligence Team' }],
  openGraph: {
    title: 'Pacifica Intelligence Terminal',
    description: 'AI-driven intelligence layer for Pacifica perpetual futures trading',
    type: 'website',
    url: 'https://pacifica-intelligence.netlify.app',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pacifica Intelligence Terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pacifica Intelligence Terminal',
    description: 'AI-driven intelligence layer for Pacifica perpetual futures trading',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
