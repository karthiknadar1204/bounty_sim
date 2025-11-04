-- Create bounties table
CREATE TABLE IF NOT EXISTS bounties (
  id SERIAL PRIMARY KEY,
  hackathon_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on hackathon_id for faster queries
CREATE INDEX IF NOT EXISTS idx_bounties_hackathon_id ON bounties(hackathon_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_bounties_status ON bounties(status);

