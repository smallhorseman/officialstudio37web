-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for published blog posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Public read access for portfolio images
CREATE POLICY "Public can read portfolio images" ON portfolio_images
  FOR SELECT USING (true);

-- Only authenticated admins can modify content
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = current_setting('app.admin_token', true)
      AND s.expires_at > NOW()
    )
  );

-- Leads can be inserted by anyone (contact forms)
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Only admins can read/update leads
CREATE POLICY "Admins can manage leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id  
      WHERE s.token = current_setting('app.admin_token', true)
      AND s.expires_at > NOW()
    )
  );
