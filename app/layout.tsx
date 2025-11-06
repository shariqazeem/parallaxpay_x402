import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ParallaxPay - AI Micropayments on Solana',
  description: 'Decentralized AI inference marketplace with x402 micropayments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}