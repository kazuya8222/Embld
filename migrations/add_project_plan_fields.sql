-- アイデアテーブルに企画書フィールドを追加
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS catch_copy TEXT,
ADD COLUMN IF NOT EXISTS service_description TEXT,
ADD COLUMN IF NOT EXISTS background_problem TEXT,
ADD COLUMN IF NOT EXISTS current_solution_problems TEXT,
ADD COLUMN IF NOT EXISTS main_target TEXT,
ADD COLUMN IF NOT EXISTS usage_scene TEXT,
ADD COLUMN IF NOT EXISTS value_proposition TEXT,
ADD COLUMN IF NOT EXISTS differentiators TEXT,
ADD COLUMN IF NOT EXISTS core_features JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS nice_to_have_features TEXT,
ADD COLUMN IF NOT EXISTS initial_flow TEXT,
ADD COLUMN IF NOT EXISTS important_operations TEXT,
ADD COLUMN IF NOT EXISTS monetization_method TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS free_paid_boundary TEXT,
ADD COLUMN IF NOT EXISTS similar_services TEXT,
ADD COLUMN IF NOT EXISTS design_atmosphere TEXT,
ADD COLUMN IF NOT EXISTS reference_urls TEXT,
ADD COLUMN IF NOT EXISTS expected_release TEXT,
ADD COLUMN IF NOT EXISTS priority_points TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS external_services TEXT,
ADD COLUMN IF NOT EXISTS one_month_goal TEXT,
ADD COLUMN IF NOT EXISTS success_metrics TEXT;

-- 既存のproblemとsolutionカラムは互換性のため残す