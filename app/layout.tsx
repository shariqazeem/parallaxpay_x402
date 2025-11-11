import type { Metadata } from 'next'
import './globals.css'
import { WalletContextProvider } from './components/WalletProvider'
import { ProviderContextProvider } from './contexts/ProviderContext'
import { ClientLayout } from '@/components/ClientLayout'

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
          <ProviderContextProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </ProviderContextProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}