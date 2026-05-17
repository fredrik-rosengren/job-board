-- Add education_level column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS education_level TEXT;

-- Verify the column was added
SELECT column_name FROM information_schema.columns 
WHERE table_name='jobs' AND column_name='education_level';
