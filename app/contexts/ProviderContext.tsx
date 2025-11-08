'use client'

/**
 * Provider Context - Global state for selected AI provider
 *
 * This connects marketplace → inference → agents
 * User selects provider in marketplace, uses it everywhere
 */

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

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
}

interface ProviderContextType {
  selectedProvider: Provider | null
  selectProvider: (provider: Provider) => void
  clearProvider: () => void
  providers: Provider[]
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined)

// Demo providers (in real app, fetch from API)
const DEMO_PROVIDERS: Provider[] = [
  {
    id: 'parallax-local',
    name: 'Parallax Local',
    endpoint: 'http://localhost:3001',
    model: 'Qwen/Qwen3-0.6B',
    pricePerToken: 0.001,
    latency: 50,
    uptime: 99.9,
    description: 'Your local Parallax node - Fast and private',
    featured: true,
  },
  {
    id: 'parallax-cloud-1',
    name: 'Parallax Cloud US-East',
    endpoint: 'https://api.parallax.xyz/us-east',
    model: 'Qwen/Qwen2.5-72B',
    pricePerToken: 0.0015,
    latency: 30,
    uptime: 99.99,
    description: 'High-performance cloud inference',
    featured: true,
  },
  {
    id: 'parallax-cloud-2',
    name: 'Parallax Cloud EU',
    endpoint: 'https://api.parallax.xyz/eu',
    model: 'Qwen/Qwen2.5-72B',
    pricePerToken: 0.0012,
    latency: 45,
    uptime: 99.95,
    description: 'European cloud inference',
  },
  {
    id: 'community-node-1',
    name: 'Community Node - Fast',
    endpoint: 'https://node1.parallax.community',
    model: 'Qwen/Qwen3-0.6B',
    pricePerToken: 0.0008,
    latency: 80,
    uptime: 98.5,
    description: 'Community-run node - Budget friendly',
  },
]

export function ProviderContextProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  // Load saved provider from localStorage on mount
  useEffect(() => {
    const savedProviderId = localStorage.getItem('parallaxpay_selected_provider')
    if (savedProviderId) {
      const provider = DEMO_PROVIDERS.find(p => p.id === savedProviderId)
      if (provider) {
        setSelectedProvider(provider)
      }
    } else {
      // Default to local Parallax
      setSelectedProvider(DEMO_PROVIDERS[0])
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
        providers: DEMO_PROVIDERS,
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
