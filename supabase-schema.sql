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

-- Insert some test data (optional)
-- DELETE FROM agents WHERE id LIKE 'test-%';
-- INSERT INTO agents (id, name, type, prompt, deployed, total_runs, status) VALUES
--   ('test-1', 'Test Agent', 'custom', 'Hello world', EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, 0, 'idle');
