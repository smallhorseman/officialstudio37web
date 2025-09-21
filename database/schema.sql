-- Create missing tables for enhanced functionality

-- Lead notes table
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'manual',
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(100),
  follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photoshoot plans table
CREATE TABLE IF NOT EXISTS photoshoot_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  date VARCHAR(100),
  location TEXT,
  style TEXT,
  inspiration TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- About content table
CREATE TABLE IF NOT EXISTS about (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site content table
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  about_title VARCHAR(255),
  about_bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site map order table
CREATE TABLE IF NOT EXISTS site_map_order (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL UNIQUE,
  page_label VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255),
  content TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_score INTEGER DEFAULT 0,
  last_edited_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add order_index to portfolio_images if it doesn't exist
ALTER TABLE portfolio_images 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Add alt_text to portfolio_images if it doesn't exist
ALTER TABLE portfolio_images 
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Add missing columns to blog_posts if they don't exist
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;

-- Insert default about content
INSERT INTO about (title, bio) 
VALUES (
  'About Studio37',
  'We are a team of passionate photographers and content creators based in Houston, TX. With a vintage heart and modern vision, we help brands and individuals tell their stories through compelling visual content.'
) ON CONFLICT DO NOTHING;

-- Insert default site content
INSERT INTO site_content (id, about_title, about_bio) 
VALUES (
  1,
  'About Studio37',
  'We are a team of passionate photographers and content creators based in Houston, TX. With a vintage heart and modern vision, we help brands and individuals tell their stories through compelling visual content.'
) ON CONFLICT (id) DO NOTHING;

-- Insert default site map order
INSERT INTO site_map_order (page_key, page_label, order_index) VALUES
  ('home', 'Home', 0),
  ('about', 'About', 1),
  ('services', 'Services', 2),
  ('portfolio', 'Portfolio', 3),
  ('blog', 'Blog', 4),
  ('contact', 'Contact', 5)
ON CONFLICT (page_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON lead_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category ON portfolio_images(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_order_index ON portfolio_images(order_index);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
