-- Studio37 Pro Database Schema with Advanced Features

-- Enable Pro extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enhanced analytics table with Pro features
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation VARCHAR(100) NOT NULL,
    duration DECIMAL(10,3) NOT NULL,
    success_rate DECIMAL(5,4),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced user sessions with Pro tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    pages_visited INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    conversion_event VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced lead scoring with AI/ML features
CREATE TABLE lead_scoring_advanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    base_score INTEGER DEFAULT 0,
    behavior_score INTEGER DEFAULT 0,
    demographic_score INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    final_score INTEGER GENERATED ALWAYS AS (
        base_score + behavior_score + demographic_score + engagement_score
    ) STORED,
    score_factors JSONB DEFAULT '{}',
    prediction_confidence DECIMAL(5,4),
    next_best_action TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B testing framework
CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    variants JSONB NOT NULL, -- {"control": {...}, "variant_a": {...}}
    allocation JSONB DEFAULT '{"control": 0.5, "variant_a": 0.5}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    sample_size INTEGER,
    confidence_level DECIMAL(5,4) DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ab_test_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    variant VARCHAR(50) NOT NULL,
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer journey mapping
CREATE TABLE customer_journey (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES leads(id),
    session_id VARCHAR(100) NOT NULL,
    journey_stage VARCHAR(50) NOT NULL, -- awareness, consideration, decision, retention
    touchpoint VARCHAR(100) NOT NULL, -- website, email, phone, social, etc.
    interaction_type VARCHAR(50) NOT NULL,
    page_url TEXT,
    content_engaged JSONB,
    time_spent INTEGER, -- seconds
    conversion_event VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced content management with SEO
CREATE TABLE seo_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    meta_description TEXT,
    keywords TEXT[],
    canonical_url TEXT,
    og_title VARCHAR(200),
    og_description TEXT,
    og_image TEXT,
    schema_markup JSONB,
    content_score INTEGER DEFAULT 0,
    last_optimized TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email marketing integration
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_name VARCHAR(200) NOT NULL,
    subject_line VARCHAR(200) NOT NULL,
    email_template JSONB NOT NULL,
    segment_criteria JSONB, -- targeting criteria
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pro-level indexes for performance
CREATE INDEX CONCURRENTLY idx_performance_metrics_operation_time ON performance_metrics(operation, timestamp DESC);
CREATE INDEX CONCURRENTLY idx_user_sessions_created_at ON user_sessions(created_at DESC);
CREATE INDEX CONCURRENTLY idx_user_sessions_conversion ON user_sessions(conversion_event) WHERE conversion_event IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_lead_scoring_final_score ON lead_scoring_advanced(final_score DESC);
CREATE INDEX CONCURRENTLY idx_customer_journey_contact_stage ON customer_journey(contact_id, journey_stage);
CREATE INDEX CONCURRENTLY idx_ab_test_assignments_test_variant ON ab_test_assignments(test_id, variant);

-- Pro-level triggers and functions
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate lead score based on interactions
    INSERT INTO lead_scoring_advanced (contact_id, base_score, behavior_score)
    VALUES (NEW.id, 
            CASE 
                WHEN NEW.phone IS NOT NULL THEN 20 ELSE 0 
            END,
            CASE 
                WHEN NEW.service IS NOT NULL THEN 30 ELSE 0 
            END
    )
    ON CONFLICT (contact_id) DO UPDATE SET
        calculated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
    AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_score();

-- Pro-level analytics views
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT 
    journey_stage,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(DISTINCT contact_id) as contacts,
    AVG(time_spent) as avg_time_spent,
    COUNT(*) FILTER (WHERE conversion_event IS NOT NULL) as conversions
FROM customer_journey
GROUP BY journey_stage
ORDER BY 
    CASE journey_stage 
        WHEN 'awareness' THEN 1
        WHEN 'consideration' THEN 2  
        WHEN 'decision' THEN 3
        WHEN 'retention' THEN 4
    END;

-- Real-time dashboard view
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '30 days') as leads_30d,
    (SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '7 days') as leads_7d,
    (SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '1 day') as leads_24h,
    (SELECT AVG(final_score) FROM lead_scoring_advanced) as avg_lead_score,
    (SELECT COUNT(DISTINCT session_id) FROM user_sessions WHERE created_at > NOW() - INTERVAL '1 day') as sessions_24h,
    (SELECT AVG(session_duration) FROM user_sessions WHERE created_at > NOW() - INTERVAL '7 days') as avg_session_duration;
