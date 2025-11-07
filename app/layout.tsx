import type { Metadata } from 'next'
import './globals.css'
import { WalletContextProvider } from './components/WalletProvider'

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
      <body className="font-sans antialiased">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
}