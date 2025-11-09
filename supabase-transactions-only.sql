-- ParallaxPay Transactions Table (PUBLIC FEED)
-- Run this if you already have the agents table created
-- Safe to run multiple times (uses IF NOT EXISTS)

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

-- Drop policies if they exist (to avoid duplicate errors)
DROP POLICY IF EXISTS "Allow public read access" ON transactions;
DROP POLICY IF EXISTS "Allow insert for all" ON transactions;

-- Create policy to allow all users to READ all transactions (PUBLIC FEED)
CREATE POLICY "Allow public read access" ON transactions
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to INSERT their own transactions
CREATE POLICY "Allow insert for all" ON transactions
  FOR INSERT
  WITH CHECK (true);

-- Verify the table was created
SELECT 'Transactions table created successfully!' as status;
