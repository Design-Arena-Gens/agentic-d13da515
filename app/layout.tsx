import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alien Earth Arrival - AI Video Generator',
  description: 'Generate cinematic videos of aliens arriving on Earth using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
