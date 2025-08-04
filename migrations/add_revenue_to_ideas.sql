-- Add revenue column to ideas table
ALTER TABLE ideas ADD COLUMN revenue BIGINT DEFAULT 0;

-- Update sample data with revenue for ハモリAI
UPDATE ideas SET revenue = 100000000 WHERE title = '会議の自動議事録アプリ';