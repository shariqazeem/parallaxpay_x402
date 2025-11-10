import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DeployedAgentDB {
  id: string
  name: string
  type: string
  prompt: string
  deployed: number
  total_runs: number
  status: string
  identity_id?: string
  last_run?: number
  last_result?: string
  provider?: string
  wallet_address?: string
  workflow?: any
}

export interface TransactionDB {
  id: string
  timestamp: number
  type: string
  agent_name?: string
  provider?: string
  tokens?: number
  cost?: number
  tx_hash?: string
  status: string
  network: string
  steps?: number
  total_cost?: number
  wallet_address?: string
  created_at?: string
}

export interface PredictionDB {
  id: string
  wallet_address: string
  timestamp: number
  asset: string
  timeframe: string
  current_price: number
  predicted_direction: 'up' | 'down' | 'neutral'
  confidence: number
  consensus_strength: number
  providers_data: any // jsonb
  total_cost: number
  tx_hash?: string
  reasoning: string
  actual_outcome?: 'up' | 'down' | 'neutral'
  accuracy?: boolean
  verified_at?: number
  created_at?: string
}
