-- Add is_internal flag to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;

-- Add type column to project_todos (internal/client)
ALTER TABLE project_todos ADD COLUMN IF NOT EXISTS type text DEFAULT 'internal';

-- For existing rows, set type to 'internal' if null
UPDATE project_todos SET type = 'internal' WHERE type IS NULL;
