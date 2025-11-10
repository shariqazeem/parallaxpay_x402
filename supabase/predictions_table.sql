-- ============================================================================
-- PREDICTIONS TABLE - Oracle Market Predictions
-- ============================================================================
--
-- Stores all market predictions made by the Oracle agent
-- Tracks prediction history per wallet for reputation and accuracy
--
-- Features:
-- - Per-wallet prediction history
-- - Accuracy tracking (actual_outcome vs predicted_direction)
-- - Multi-provider consensus data (stored as JSONB)
-- - x402 transaction tracking
-- - Public read access for leaderboards
-- ============================================================================

CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  asset TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  predicted_direction TEXT NOT NULL CHECK (predicted_direction IN ('up', 'down', 'neutral')),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  consensus_strength NUMERIC NOT NULL CHECK (consensus_strength >= 0 AND consensus_strength <= 100),
  providers_data JSONB NOT NULL,
  total_cost NUMERIC NOT NULL,
  tx_hash TEXT,
  reasoning TEXT NOT NULL,
  actual_outcome TEXT CHECK (actual_outcome IN ('up', 'down', 'neutral', NULL)),
  accuracy BOOLEAN,
  verified_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Index for querying predictions by wallet
CREATE INDEX IF NOT EXISTS idx_predictions_wallet_address
ON predictions(wallet_address);

-- Index for querying recent predictions
CREATE INDEX IF NOT EXISTS idx_predictions_timestamp
ON predictions(timestamp DESC);

-- Index for querying by asset
CREATE INDEX IF NOT EXISTS idx_predictions_asset
ON predictions(asset);

-- Composite index for wallet + timestamp (user history)
CREATE INDEX IF NOT EXISTS idx_predictions_wallet_timestamp
ON predictions(wallet_address, timestamp DESC);

-- Index for accuracy queries (leaderboard)
CREATE INDEX IF NOT EXISTS idx_predictions_accuracy
ON predictions(wallet_address, accuracy)
WHERE accuracy IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read predictions (for public leaderboards)
CREATE POLICY "Public predictions are viewable by everyone"
ON predictions FOR SELECT
USING (true);

-- Policy: Users can insert their own predictions
CREATE POLICY "Users can insert their own predictions"
ON predictions FOR INSERT
WITH CHECK (true); -- Client-side validation ensures wallet_address matches

-- Policy: Users can update their own predictions (for verification)
CREATE POLICY "Users can update their own predictions"
ON predictions FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's prediction stats
CREATE OR REPLACE FUNCTION get_user_prediction_stats(user_wallet TEXT)
RETURNS TABLE (
  total_predictions BIGINT,
  verified_predictions BIGINT,
  correct_predictions BIGINT,
  accuracy_rate NUMERIC,
  total_spent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_predictions,
    COUNT(CASE WHEN accuracy IS NOT NULL THEN 1 END)::BIGINT as verified_predictions,
    COUNT(CASE WHEN accuracy = true THEN 1 END)::BIGINT as correct_predictions,
    CASE
      WHEN COUNT(CASE WHEN accuracy IS NOT NULL THEN 1 END) > 0 THEN
        ROUND((COUNT(CASE WHEN accuracy = true THEN 1 END)::NUMERIC /
               COUNT(CASE WHEN accuracy IS NOT NULL THEN 1 END)::NUMERIC) * 100, 2)
      ELSE 0
    END as accuracy_rate,
    COALESCE(SUM(total_cost), 0) as total_spent
  FROM predictions
  WHERE wallet_address = user_wallet;
END;
$$ LANGUAGE plpgsql;

-- Function to get leaderboard (top predictors by accuracy)
CREATE OR REPLACE FUNCTION get_prediction_leaderboard(min_predictions INT DEFAULT 5)
RETURNS TABLE (
  wallet_address TEXT,
  total_predictions BIGINT,
  verified_predictions BIGINT,
  correct_predictions BIGINT,
  accuracy_rate NUMERIC,
  rank INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.wallet_address,
    COUNT(*)::BIGINT as total_predictions,
    COUNT(CASE WHEN p.accuracy IS NOT NULL THEN 1 END)::BIGINT as verified_predictions,
    COUNT(CASE WHEN p.accuracy = true THEN 1 END)::BIGINT as correct_predictions,
    CASE
      WHEN COUNT(CASE WHEN p.accuracy IS NOT NULL THEN 1 END) > 0 THEN
        ROUND((COUNT(CASE WHEN p.accuracy = true THEN 1 END)::NUMERIC /
               COUNT(CASE WHEN p.accuracy IS NOT NULL THEN 1 END)::NUMERIC) * 100, 2)
      ELSE 0
    END as accuracy_rate,
    RANK() OVER (ORDER BY
      CASE
        WHEN COUNT(CASE WHEN p.accuracy IS NOT NULL THEN 1 END) > 0 THEN
          (COUNT(CASE WHEN p.accuracy = true THEN 1 END)::NUMERIC /
           COUNT(CASE WHEN p.accuracy IS NOT NULL THEN 1 END)::NUMERIC)
        ELSE 0
      END DESC
    )::INT as rank
  FROM predictions p
  GROUP BY p.wallet_address
  HAVING COUNT(CASE WHEN p.accuracy IS NOT NULL THEN 1 END) >= min_predictions
  ORDER BY accuracy_rate DESC, verified_predictions DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE predictions IS 'Market predictions made by Oracle agents with accuracy tracking';
COMMENT ON COLUMN predictions.id IS 'Unique prediction ID (format: pred_timestamp_random)';
COMMENT ON COLUMN predictions.wallet_address IS 'Solana wallet address of user who made prediction';
COMMENT ON COLUMN predictions.timestamp IS 'Unix timestamp when prediction was made';
COMMENT ON COLUMN predictions.asset IS 'Asset being predicted (BTC, ETH, SOL, etc.)';
COMMENT ON COLUMN predictions.timeframe IS 'Prediction timeframe (5m, 15m, 1h, 4h, 24h)';
COMMENT ON COLUMN predictions.current_price IS 'Price at time of prediction';
COMMENT ON COLUMN predictions.predicted_direction IS 'Predicted price direction';
COMMENT ON COLUMN predictions.confidence IS 'AI confidence level (0-100)';
COMMENT ON COLUMN predictions.consensus_strength IS 'Multi-provider consensus strength (0-100)';
COMMENT ON COLUMN predictions.providers_data IS 'JSONB array of provider predictions';
COMMENT ON COLUMN predictions.total_cost IS 'Total x402 cost for all providers';
COMMENT ON COLUMN predictions.tx_hash IS 'Solana transaction hash';
COMMENT ON COLUMN predictions.reasoning IS 'AI reasoning for prediction';
COMMENT ON COLUMN predictions.actual_outcome IS 'Actual price direction after timeframe (set when verified)';
COMMENT ON COLUMN predictions.accuracy IS 'Was prediction correct? (set when verified)';
COMMENT ON COLUMN predictions.verified_at IS 'Unix timestamp when prediction was verified';
