-- First, ensure leads table exists with proper structure
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    service VARCHAR(100),
    status VARCHAR(50) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure projects table exists
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    opportunity_amount DECIMAL(10,2) DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'Inquiry',
    notes TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    completion INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Notes table for CRM note tracking
CREATE TABLE IF NOT EXISTS lead_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact History table for CRM contact tracking
CREATE TABLE IF NOT EXISTS contact_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL DEFAULT 'email',
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'Sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Todos table for project management
CREATE TABLE IF NOT EXISTS project_todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photoshoot Plans table
CREATE TABLE IF NOT EXISTS photoshoot_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    date DATE,
    location TEXT,
    style TEXT,
    inspiration TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Content table for CMS
CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY DEFAULT 1,
    about_title VARCHAR(255),
    about_bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site content
INSERT INTO site_content (id, about_title, about_bio) 
VALUES (1, 'About Studio37', 'Your story begins here...')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON lead_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_history_lead_id ON contact_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_created_at ON contact_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_todos_project_id ON project_todos(project_id);

-- Enable Row Level Security (RLS) - but with permissive policies for development
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE photoshoot_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Allow all operations on lead_notes" ON lead_notes;
DROP POLICY IF EXISTS "Allow all operations on contact_history" ON contact_history;
DROP POLICY IF EXISTS "Allow all operations on project_todos" ON project_todos;
DROP POLICY IF EXISTS "Allow all operations on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow all operations on photoshoot_plans" ON photoshoot_plans;

-- Create permissive RLS policies (Allow all operations for anon role)
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lead_notes" ON lead_notes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contact_history" ON contact_history FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on project_todos" ON project_todos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on site_content" ON site_content FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on photoshoot_plans" ON photoshoot_plans FOR ALL TO anon USING (true) WITH CHECK (true);

-- Add policies for authenticated users as well
CREATE POLICY "Allow all operations on leads for authenticated" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on projects for authenticated" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on lead_notes for authenticated" ON lead_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contact_history for authenticated" ON contact_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on project_todos for authenticated" ON project_todos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on site_content for authenticated" ON site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on photoshoot_plans for authenticated" ON photoshoot_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_notes_updated_at BEFORE UPDATE ON lead_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_history_updated_at BEFORE UPDATE ON contact_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_todos_updated_at BEFORE UPDATE ON project_todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
