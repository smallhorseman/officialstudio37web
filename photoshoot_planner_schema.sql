-- Photoshoot plans table for AI planner
CREATE TABLE IF NOT EXISTS photoshoot_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  date date,
  location text,
  style text,
  inspiration text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);