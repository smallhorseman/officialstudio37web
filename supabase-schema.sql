-- Drop and recreate tables with proper structure
DROP TABLE IF EXISTS lead_notes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS portfolio_images CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS photoshoot_plans CASCADE;

-- Leads table with all necessary columns
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service VARCHAR(255),
    status VARCHAR(50) DEFAULT 'New',
    source VARCHAR(100) DEFAULT 'website',
    due_date DATE,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead notes table for CRM functionality
CREATE TABLE lead_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'manual',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'Active',
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table for project management
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Planning',
    budget DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    type VARCHAR(100) DEFAULT 'Photography',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio images table for CMS
CREATE TABLE portfolio_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    category VARCHAR(100),
    caption TEXT,
    alt_text TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table for blog management
CREATE TABLE blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    author VARCHAR(255) DEFAULT 'Studio37',
    category VARCHAR(100),
    tags TEXT[],
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'draft',
    featured_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Content table for CMS
CREATE TABLE site_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    about_title VARCHAR(255),
    about_bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photoshoot Plans table
CREATE TABLE photoshoot_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    date DATE,
    location TEXT,
    style TEXT,
    inspiration TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site content
INSERT INTO site_content (id, about_title, about_bio) 
VALUES (1, 'About Studio37', 'Your story begins here...')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON portfolio_images(order_index);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_images(category);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_publish_date ON blog_posts(publish_date DESC);

-- Enable Row Level Security (RLS) for production
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE photoshoot_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access and admin write access
-- Leads policies (admin only)
CREATE POLICY "Enable read access for authenticated users" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for all users" ON leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Lead notes policies (admin only)
CREATE POLICY "Enable read access for authenticated users" ON lead_notes
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON lead_notes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON lead_notes
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Projects policies (admin only)
CREATE POLICY "Enable read access for authenticated users" ON projects
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON projects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON projects
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Portfolio images policies (public read, admin write)
CREATE POLICY "Enable read access for all users" ON portfolio_images
    FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON portfolio_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON portfolio_images
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON portfolio_images
    FOR DELETE USING (auth.role() = 'authenticated');

-- Blog posts policies (public read published, admin full access)
CREATE POLICY "Enable read access for published posts" ON blog_posts
    FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON blog_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON blog_posts
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON blog_posts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Site content policies (public read, admin write)
CREATE POLICY "Enable read access for all users" ON site_content
    FOR SELECT USING (true);
CREATE POLICY "Enable update access for authenticated users" ON site_content
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Photoshoot plans policies (public insert, admin read)
CREATE POLICY "Enable insert access for all users" ON photoshoot_plans
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for authenticated users" ON photoshoot_plans
    FOR SELECT USING (auth.role() = 'authenticated');
