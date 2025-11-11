'use client'

import { useState, useEffect } from 'react'
import { StartupScreen } from './StartupScreen'
import { Toaster } from 'react-hot-toast'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showStartup, setShowStartup] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user has seen startup screen this session
    const hasSeenStartup = sessionStorage.getItem('parallaxpay_startup_seen')

    if (hasSeenStartup) {
      setShowStartup(false)
    }
  }, [])

  const handleStartupComplete = () => {
    sessionStorage.setItem('parallaxpay_startup_seen', 'true')
    setShowStartup(false)
  }

  if (!mounted) {
    return null // Avoid hydration mismatch
  }

  return (
    <>
      {showStartup ? (
        // Show ONLY startup screen, no children
        <StartupScreen onComplete={handleStartupComplete} />
      ) : (
        // Show ONLY children after startup completes
        <>
          {children}

          {/* Toast Notifications Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#000',
                fontWeight: '600',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  border: '2px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  border: '2px solid #ef4444',
                },
              },
            }}
          />
        </>
      )}
    </>
  )
}
