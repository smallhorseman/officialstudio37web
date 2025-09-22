-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CONTACTS TABLE (Main CRM Entity)
-- =============================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) GENERATED ALWAYS AS (split_part(full_name, ' ', 1)) STORED,
    last_name VARCHAR(100) GENERATED ALWAYS AS (split_part(full_name, ' ', 2)) STORED,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    service_interest VARCHAR(100),
    message TEXT,
    source VARCHAR(50) DEFAULT 'website',
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed_lost')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(message, ''))
    ) STORED
);

-- =============================================
-- CONTACT INTERACTIONS (Activity Tracking)
-- =============================================
CREATE TABLE contact_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'form_submission', 'email_sent', 'email_received', 'phone_call', 
        'meeting', 'quote_sent', 'contract_signed', 'payment_received', 'note'
    )),
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subject VARCHAR(255),
    notes TEXT,
    channel VARCHAR(50) DEFAULT 'website' CHECK (channel IN (
        'website', 'email', 'phone', 'social_media', 'referral', 'direct'
    )),
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LEAD SCORING SYSTEM
-- =============================================
CREATE TABLE lead_scoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 100,
    factors TEXT[] DEFAULT '{}',
    calculation_details JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure latest score per contact
    UNIQUE(contact_id, calculated_at)
);

-- =============================================
-- PROJECTS & BOOKINGS
-- =============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL CHECK (project_type IN (
        'portrait', 'wedding', 'commercial', 'content_strategy', 'consultation'
    )),
    project_status VARCHAR(50) DEFAULT 'inquiry' CHECK (project_status IN (
        'inquiry', 'quoted', 'booked', 'in_progress', 'completed', 'cancelled'
    )),
    project_date DATE,
    estimated_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    final_payment_date DATE,
    deliverables TEXT[],
    special_requirements TEXT,
    location VARCHAR(255),
    duration_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- HUBSPOT SYNC TRACKING
-- =============================================
CREATE TABLE hubspot_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    hubspot_contact_id VARCHAR(50),
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed')),
    sync_attempts INTEGER DEFAULT 0,
    error_message TEXT,
    sync_data JSONB DEFAULT '{}'
);

-- =============================================
-- SYSTEM LOGS & AUDIT TRAIL
-- =============================================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type VARCHAR(50) NOT NULL CHECK (log_type IN (
        'info', 'warning', 'error', 'success', 'audit'
    )),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================
CREATE TABLE website_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    page_url TEXT NOT NULL,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    time_on_page INTEGER, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

CREATE INDEX idx_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX idx_interactions_date ON contact_interactions(interaction_date DESC);
CREATE INDEX idx_interactions_type ON contact_interactions(interaction_type);

CREATE INDEX idx_lead_scoring_contact_id ON lead_scoring(contact_id);
CREATE INDEX idx_lead_scoring_score ON lead_scoring(score DESC);
CREATE INDEX idx_lead_scoring_date ON lead_scoring(calculated_at DESC);

CREATE INDEX idx_projects_contact_id ON projects(contact_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_date ON projects(project_date);

CREATE INDEX idx_hubspot_sync_contact_id ON hubspot_sync(contact_id);
CREATE INDEX idx_hubspot_sync_status ON hubspot_sync(sync_status);

CREATE INDEX idx_system_logs_type ON system_logs(log_type);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);

CREATE INDEX idx_analytics_session ON website_analytics(session_id);
CREATE INDEX idx_analytics_contact ON website_analytics(contact_id);
CREATE INDEX idx_analytics_created_at ON website_analytics(created_at DESC);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATES
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- VIEWS FOR ADMIN DASHBOARD
-- =============================================
CREATE OR REPLACE VIEW contact_summary AS
SELECT 
    c.*,
    ls.score as lead_score,
    ls.calculated_at as score_updated_at,
    COUNT(ci.id) as interaction_count,
    MAX(ci.interaction_date) as last_interaction,
    COUNT(p.id) as project_count,
    COALESCE(SUM(p.actual_value), 0) as total_revenue,
    hs.sync_status as hubspot_status,
    hs.last_sync_at as hubspot_last_sync
FROM contacts c
LEFT JOIN lead_scoring ls ON c.id = ls.contact_id 
    AND ls.calculated_at = (
        SELECT MAX(calculated_at) 
        FROM lead_scoring ls2 
        WHERE ls2.contact_id = c.id
    )
LEFT JOIN contact_interactions ci ON c.id = ci.contact_id
LEFT JOIN projects p ON c.id = p.contact_id
LEFT JOIN hubspot_sync hs ON c.id = hs.contact_id
GROUP BY c.id, ls.score, ls.calculated_at, hs.sync_status, hs.last_sync_at;

CREATE OR REPLACE VIEW pipeline_metrics AS
SELECT 
    status,
    COUNT(*) as contact_count,
    AVG(ls.score) as avg_lead_score,
    COUNT(p.id) as project_count,
    SUM(p.estimated_value) as pipeline_value
FROM contacts c
LEFT JOIN lead_scoring ls ON c.id = ls.contact_id
LEFT JOIN projects p ON c.id = p.contact_id AND p.project_status != 'cancelled'
GROUP BY status;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scoring ENABLE ROW LEVEL SECURITY;

-- Admin users can see all records
CREATE POLICY "Admin full access" ON contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Users can only see their assigned contacts
CREATE POLICY "User assigned contacts" ON contacts
    FOR SELECT USING (assigned_to = auth.uid());

-- =============================================
-- STORED PROCEDURES FOR CRM OPERATIONS
-- =============================================
CREATE OR REPLACE FUNCTION create_contact_with_interaction(
    p_name VARCHAR(255),
    p_email VARCHAR(255),
    p_phone VARCHAR(20) DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_service VARCHAR(100) DEFAULT NULL,
    p_source VARCHAR(50) DEFAULT 'website'
)
RETURNS UUID AS $$
DECLARE
    contact_id UUID;
    lead_score INTEGER;
BEGIN
    -- Insert contact
    INSERT INTO contacts (full_name, email, phone, message, service_interest, source)
    VALUES (p_name, p_email, p_phone, p_message, p_service, p_source)
    RETURNING id INTO contact_id;
    
    -- Create initial interaction
    INSERT INTO contact_interactions (contact_id, interaction_type, notes, channel)
    VALUES (contact_id, 'form_submission', 
            CONCAT('Initial contact - Service: ', COALESCE(p_service, 'Not specified')), 
            'website');
    
    -- Calculate and store lead score
    lead_score := 0;
    IF p_phone IS NOT NULL THEN lead_score := lead_score + 20; END IF;
    IF p_service IS NOT NULL THEN lead_score := lead_score + 30; END IF;
    IF LENGTH(p_message) > 50 THEN lead_score := lead_score + 25; END IF;
    IF p_email LIKE '%@gmail.com' OR p_email LIKE '%@yahoo.com' THEN 
        lead_score := lead_score + 10; 
    ELSE 
        lead_score := lead_score + 15; 
    END IF;
    
    INSERT INTO lead_scoring (contact_id, score, factors)
    VALUES (contact_id, lead_score, 
            ARRAY['form_submission'] || 
            CASE WHEN p_phone IS NOT NULL THEN ARRAY['has_phone'] ELSE ARRAY[]::TEXT[] END ||
            CASE WHEN p_service IS NOT NULL THEN ARRAY['selected_service'] ELSE ARRAY[]::TEXT[] END ||
            CASE WHEN LENGTH(p_message) > 50 THEN ARRAY['detailed_message'] ELSE ARRAY[]::TEXT[] END
    );
    
    RETURN contact_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================
INSERT INTO contacts (full_name, email, phone, service_interest, message, source, status) VALUES
('John Smith', 'john@example.com', '555-0123', 'wedding', 'Looking for wedding photography for June 2024', 'website', 'new'),
('Sarah Johnson', 'sarah@techcorp.com', '555-0456', 'commercial', 'Need headshots for our team', 'referral', 'contacted'),
('Mike Brown', 'mike.brown@gmail.com', NULL, 'portrait', 'Family portrait session needed', 'social_media', 'new');
