-- Add source field to leads table if it doesn't exist
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'Website';

-- Add metadata field for flexible data storage
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add conversation metadata
ALTER TABLE chatbot_conversations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index on source for analytics
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rate_limit_identifier ON rate_limit_tracking(identifier, window_start);
