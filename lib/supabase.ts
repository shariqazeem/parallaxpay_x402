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
