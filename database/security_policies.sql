-- Enhanced RLS Policies for Studio37

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access for portfolio
CREATE POLICY "Public can read portfolio images" ON portfolio_images
  FOR SELECT USING (true);

-- Leads can be inserted by anyone (contact forms)
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Chatbot conversations can be inserted
CREATE POLICY "Anyone can create chatbot conversations" ON chatbot_conversations
  FOR INSERT WITH CHECK (true);

-- Analytics events can be inserted
CREATE POLICY "Anyone can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Admin-only access for management
CREATE POLICY "Admin can manage all data" ON leads
  FOR ALL USING (
    current_setting('app.user_role', true) = 'admin'
  );

CREATE POLICY "Admin can manage projects" ON projects
  FOR ALL USING (
    current_setting('app.user_role', true) = 'admin'
  );

CREATE POLICY "Admin can manage portfolio" ON portfolio_images
  FOR ALL USING (
    current_setting('app.user_role', true) = 'admin'
  );
