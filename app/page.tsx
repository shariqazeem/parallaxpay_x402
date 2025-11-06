import Hero from './components/Hero'
import LiveStats from './components/LiveStats'
import ProviderLeaderboard from './components/ProviderLeaderboard'
import HowItWorks from './components/HowItWorks'
import CTA from './components/CTA'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background-primary">
      <Hero />
      <LiveStats />
      <ProviderLeaderboard />
      <HowItWorks />
      <CTA />
    </main>
  )
}