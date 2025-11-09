-- ParallaxPay Agents Table Schema
-- Run this SQL in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/qgfniejzlzesflgdgcwe/sql

-- Create the agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  deployed BIGINT NOT NULL,
  total_runs INT DEFAULT 0,
  status TEXT DEFAULT 'idle',
  identity_id TEXT,
  last_run BIGINT,
  last_result TEXT,
  provider TEXT,
  wallet_address TEXT,
  workflow JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on deployed timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_deployed ON agents(deployed DESC);

-- Create an index on wallet_address for user filtering
CREATE INDEX IF NOT EXISTS idx_agents_wallet ON agents(wallet_address);

-- Enable Row Level Security (RLS) - optional, can be disabled for hackathon demo
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (for demo purposes)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations for demo" ON agents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create the transactions table (PUBLIC - visible to all users)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL,
  agent_name TEXT,
  provider TEXT,
  tokens INT,
  cost NUMERIC(10, 6),
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  network TEXT DEFAULT 'solana-devnet',
  steps INT,
  total_cost NUMERIC(10, 6),
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);

-- Create an index on wallet_address for user filtering
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);

-- Create an index on type for filtering by transaction type
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to READ all transactions (PUBLIC FEED)
CREATE POLICY "Allow public read access" ON transactions
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to INSERT their own transactions
CREATE POLICY "Allow insert for all" ON transactions
  FOR INSERT
  WITH CHECK (true);

-- Insert some test data (optional)
-- DELETE FROM agents WHERE id LIKE 'test-%';
-- INSERT INTO agents (id, name, type, prompt, deployed, total_runs, status) VALUES
--   ('test-1', 'Test Agent', 'custom', 'Hello world', EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, 0, 'idle');
