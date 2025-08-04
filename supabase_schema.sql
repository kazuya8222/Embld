-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  google_avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  is_developer BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アイデアテーブル
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  target_users TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  sketch_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_development', 'completed')),
  revenue BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 「欲しい！」ボタン
CREATE TABLE wants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- コメント
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 完成アプリ
CREATE TABLE completed_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  description TEXT,
  app_url TEXT,
  store_urls JSONB,
  screenshots TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レビュー
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES completed_apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サブスクリプション管理
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支払い履歴
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'jpy',
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_wants_idea_id ON wants(idea_id);
CREATE INDEX idx_comments_idea_id ON comments(idea_id);
CREATE INDEX idx_completed_apps_idea_id ON completed_apps(idea_id);

-- RLS (Row Level Security) ポリシー
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE wants ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- ユーザーポリシー
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- アイデアポリシー
CREATE POLICY "Anyone can view ideas" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- 「欲しい！」ポリシー
CREATE POLICY "Anyone can view wants" ON wants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage wants" ON wants
  FOR ALL USING (auth.uid() = user_id);

-- コメントポリシー
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 完成アプリポリシー
CREATE POLICY "Anyone can view completed apps" ON completed_apps
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create apps" ON completed_apps
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Developers can update own apps" ON completed_apps
  FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Developers can delete own apps" ON completed_apps
  FOR DELETE USING (auth.uid() = developer_id);

-- レビューポリシー
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- サブスクリプションポリシー
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- 支払い履歴ポリシー
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- サンプルデータ
INSERT INTO users (id, email, username, auth_provider, is_developer) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user1@example.com', 'アイデアマン', 'email', false),
  ('22222222-2222-2222-2222-222222222222', 'dev1@example.com', '開発太郎', 'email', true),
  ('33333333-3333-3333-3333-333333333333', 'user2@example.com', 'ユーザー花子', 'email', false);

INSERT INTO ideas (id, user_id, title, problem, solution, category, tags) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '会議の自動議事録アプリ', '会議中にメモを取るのが大変で、重要な内容を聞き逃してしまう', '音声認識で自動的に議事録を作成し、重要ポイントをハイライト', '仕事効率化', ARRAY['AI', '音声認識', '議事録']),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '家計簿アプリ with AI分析', '家計簿をつけるのが面倒で続かない', 'レシート撮影で自動入力、AIが支出傾向を分析してアドバイス', 'ライフスタイル', ARRAY['AI', '家計簿', 'OCR']),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '読書記録SNS', '読んだ本の感想を共有したいが、良いプラットフォームがない', '本の感想を投稿し、同じ趣味の人とつながれるSNS', 'SNS・コミュニケーション', ARRAY['読書', 'SNS', '感想']);

-- サンプルの「欲しい！」データ
INSERT INTO wants (idea_id, user_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111');

-- サンプルコメント
INSERT INTO comments (idea_id, user_id, content) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'これは素晴らしいアイデアですね！開発してみたいです。'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'ぜひ使いたいです！レシート撮影機能は便利そう。'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '読書好きとしては、とても魅力的なアプリです。');