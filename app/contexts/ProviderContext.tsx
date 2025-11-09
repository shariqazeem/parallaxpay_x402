'use client'

/**
 * Provider Context - Global state for selected AI provider
 *
 * NOW WITH REAL PROVIDERS! 🔥
 *
 * This connects marketplace → inference → agents
 * Discovers ACTUAL Parallax nodes and shows REAL data
 */

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { getRealProviderManager, type RealProvider } from '@/lib/real-provider-manager'

export interface Provider {
  id: string
  name: string
  endpoint: string
  model: string
  pricePerToken: number
  latency: number // ms
  uptime: number // percentage
  description: string
  featured?: boolean
  online?: boolean // Real status
  minReputation?: number // Minimum reputation score required (0-1000)
  tier?: 'free' | 'standard' | 'premium' // Provider tier
}

interface ProviderContextType {
  selectedProvider: Provider | null
  selectProvider: (provider: Provider) => void
  clearProvider: () => void
  providers: Provider[]
  discoverProviders: () => Promise<void>
  isDiscovering: boolean
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined)

/**
 * Convert RealProvider to Provider format
 */
function convertRealProvider(realProvider: RealProvider): Provider {
  // Determine tier and reputation requirement based on performance
  let tier: 'free' | 'standard' | 'premium' = 'free'
  let minReputation = 0

  if (realProvider.latency < 100 && realProvider.uptime > 99) {
    tier = 'premium'
    minReputation = 400 // Elite+ required
  } else if (realProvider.latency < 300 && realProvider.uptime > 95) {
    tier = 'standard'
    minReputation = 200 // Trusted+ required
  }
  // else tier = 'free', minReputation = 0 (anyone can use)

  return {
    id: realProvider.id,
    name: realProvider.name,
    endpoint: realProvider.url,
    model: realProvider.model,
    pricePerToken: realProvider.price,
    latency: realProvider.latency,
    uptime: realProvider.uptime,
    description: `${realProvider.region} - ${realProvider.online ? 'Online' : 'Offline'}`,
    featured: realProvider.online && realProvider.latency < 100,
    online: realProvider.online,
    tier,
    minReputation,
  }
}

export function ProviderContextProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)

  /**
   * Discover REAL providers from Parallax nodes
   */
  const discoverProviders = async () => {
    console.log('🔍 Discovering REAL Parallax providers...')
    setIsDiscovering(true)

    try {
      const providerManager = getRealProviderManager()
      const realProviders = await providerManager.discoverProviders()

      const convertedProviders = realProviders.map(convertRealProvider)
      setProviders(convertedProviders)

      console.log(`✅ Discovered ${convertedProviders.length} real providers`)

      // Auto-select best provider if none selected
      if (!selectedProvider && convertedProviders.length > 0) {
        const onlineProviders = convertedProviders.filter(p => p.online)
        if (onlineProviders.length > 0) {
          const best = onlineProviders.reduce((a, b) =>
            a.latency < b.latency ? a : b
          )
          setSelectedProvider(best)
          localStorage.setItem('parallaxpay_selected_provider', best.id)
          console.log('✅ Auto-selected best provider:', best.name)
        }
      }
    } catch (error) {
      console.error('Failed to discover providers:', error)
    } finally {
      setIsDiscovering(false)
    }
  }

  // Discover providers on mount
  useEffect(() => {
    discoverProviders()

    // Load saved provider from localStorage
    const savedProviderId = localStorage.getItem('parallaxpay_selected_provider')
    if (savedProviderId) {
      // Wait for providers to be discovered, then select saved one
      const checkInterval = setInterval(() => {
        const provider = providers.find(p => p.id === savedProviderId)
        if (provider) {
          setSelectedProvider(provider)
          clearInterval(checkInterval)
        }
      }, 100)

      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkInterval), 5000)
    }
  }, [])

  const selectProvider = (provider: Provider) => {
    setSelectedProvider(provider)
    localStorage.setItem('parallaxpay_selected_provider', provider.id)
    console.log('✅ Provider selected:', provider.name)
  }

  const clearProvider = () => {
    setSelectedProvider(null)
    localStorage.removeItem('parallaxpay_selected_provider')
  }

  return (
    <ProviderContext.Provider
      value={{
        selectedProvider,
        selectProvider,
        clearProvider,
        providers,
        discoverProviders,
        isDiscovering,
      }}
    >
      {children}
    </ProviderContext.Provider>
  )
}

export function useProvider() {
  const context = useContext(ProviderContext)
  if (!context) {
    throw new Error('useProvider must be used within ProviderContextProvider')
  }
  return context
}
