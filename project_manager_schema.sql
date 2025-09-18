-- Projects table (lead_id is bigint to match leads.id)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id bigint REFERENCES leads(id),
  name text,
  client text,
  opportunity_amount numeric,
  stage text, -- e.g. Inquiry, Proposal, Booked, In Progress, Delivered, Closed
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Project todos table
CREATE TABLE IF NOT EXISTS project_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  task text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
