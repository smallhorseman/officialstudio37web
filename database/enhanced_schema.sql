-- Enhanced lead_notes table for CRM
ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS note_type VARCHAR(50) DEFAULT 'manual';
ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP;

-- Enhanced portfolio_images for better CMS
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Enhanced blog_posts for SEO and markdown
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- New page_content table for sitemap editing
CREATE TABLE IF NOT EXISTS page_content (
  id SERIAL PRIMARY KEY,
  page_key VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  seo_score INTEGER DEFAULT 0,
  last_edited_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default page content
INSERT INTO page_content (page_key, title, content, meta_title, meta_description) VALUES
('home', 'Welcome to Studio37', 'Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.', 'Studio37 - Professional Photography Houston TX', 'Professional photography and content strategy in Houston, TX. Vintage-inspired, modern approach.'),
('about', 'About Studio37', 'We are a team of passionate photographers and content strategists based in Houston, TX. Our mission is to help brands tell their stories through compelling visual content.', 'About Studio37 - Houston Photography Team', 'Meet the Studio37 team of professional photographers and content strategists in Houston, TX.'),
('services', 'Our Services', 'We offer comprehensive photography services including portraits, weddings, events, and commercial photography with full content strategy.', 'Photography Services - Studio37 Houston', 'Professional photography services in Houston: portraits, weddings, events, commercial photography, and content strategy.'),
('portfolio', 'Our Work', 'A curated selection of our favorite moments and projects showcasing our vintage-inspired, modern photography style.', 'Photography Portfolio - Studio37 Houston', 'View our professional photography portfolio showcasing work in Houston, TX and surrounding areas.'),
('blog', 'Blog', 'Insights, tips, and stories from behind the lens. Photography tutorials, industry news, and creative inspiration.', 'Photography Blog - Studio37 Houston', 'Photography tips, tutorials, and behind-the-scenes insights from professional photographers in Houston, TX.'),
('contact', 'Contact Us', 'Ready to start your project? Let''s talk. We serve Houston, TX and the surrounding 50-mile radius.', 'Contact Studio37 - Houston Photography', 'Contact Studio37 for professional photography services in Houston, TX. Get your quote today.')
ON CONFLICT (page_key) DO NOTHING;

-- Analytics tables for interactive charts
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  user_id TEXT,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead conversion tracking
CREATE TABLE IF NOT EXISTS lead_conversions (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  conversion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Project milestones for better tracking
CREATE TABLE IF NOT EXISTS project_milestones (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  milestone_name VARCHAR(100) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  completed_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced project_tasks
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category ON portfolio_images(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_featured ON portfolio_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_lead_conversions_lead_date ON lead_conversions(lead_id, conversion_date);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
    BEFORE UPDATE ON page_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admins can manage page content" ON page_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = current_setting('app.admin_token', true)
      AND s.expires_at > NOW()
    )
  );

CREATE POLICY "Analytics events insert only" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = current_setting('app.admin_token', true)
      AND s.expires_at > NOW()
    )
  );
