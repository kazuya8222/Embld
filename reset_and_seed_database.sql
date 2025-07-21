-- 既存のテーブルを削除（外部キー制約を考慮した順序）
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS completed_apps CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS wants CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- テーブル再作成
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

-- ダミーデータの投入
-- ユーザーデータ（開発者・一般ユーザー・プレミアムユーザー）
INSERT INTO users (id, email, username, auth_provider, is_developer, is_premium, avatar_url) VALUES
  ('01234567-89ab-cdef-0123-456789abcdef', 'user1@example.com', 'アイデアマン田中', 'email', false, false, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('12345678-9abc-def0-1234-56789abcdef0', 'dev1@example.com', '開発太郎', 'email', true, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('23456789-abcd-ef01-2345-6789abcdef01', 'user2@example.com', 'ユーザー花子', 'email', false, true, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'),
  ('3456789a-bcde-f012-3456-789abcdef012', 'dev2@example.com', 'デベロッパー佐藤', 'email', true, false, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('456789ab-cdef-0123-4567-89abcdef0123', 'user3@example.com', 'アプリ好き山田', 'google', false, false, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
  ('56789abc-def0-1234-5678-9abcdef01234', 'creator@example.com', 'クリエイター鈴木', 'email', true, true, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150');

-- アイデアデータ（様々なカテゴリー・ステータス）
INSERT INTO ideas (id, user_id, title, problem, solution, target_users, category, tags, status, created_at) VALUES
  ('a1234567-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', '会議の自動議事録アプリ', '会議中にメモを取るのが大変で、重要な内容を聞き逃してしまう', '音声認識で自動的に議事録を作成し、重要ポイントをハイライト表示。参加者全員で共有可能', 'ビジネスパーソン、チームリーダー', '仕事効率化', ARRAY['AI', '音声認識', '議事録', 'チーム'], 'open', NOW() - INTERVAL '5 days'),
  ('b1234567-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', '家計簿アプリ with AI分析', '家計簿をつけるのが面倒で続かない', 'レシート撮影で自動入力、AIが支出傾向を分析してアドバイス提供', '節約したい人、家計管理が苦手な人', 'ライフスタイル', ARRAY['AI', '家計簿', 'OCR', '節約'], 'in_development', NOW() - INTERVAL '3 days'),
  ('c1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', '読書記録SNS', '読んだ本の感想を共有したいが、良いプラットフォームがない', '本の感想を投稿し、同じ趣味の人とつながれるSNS。おすすめ機能付き', '読書好き、本の感想を共有したい人', 'SNS・コミュニケーション', ARRAY['読書', 'SNS', '感想', '推薦'], 'completed', NOW() - INTERVAL '10 days'),
  ('d1234567-89ab-cdef-0123-456789abcdef', '456789ab-cdef-0123-4567-89abcdef0123', '筋トレ記録＆モチベーション管理', '筋トレを続けるモチベーションが維持できない', 'トレーニング記録、進捗の可視化、友達との競争機能でモチベーション維持', 'フィットネス初心者〜中級者', 'ヘルス・フィットネス', ARRAY['筋トレ', 'モチベーション', '記録', '競争'], 'open', NOW() - INTERVAL '1 day'),
  ('e1234567-89ab-cdef-0123-456789abcdef', '3456789a-bcde-f012-3456-789abcdef012', 'プログラミング学習支援アプリ', 'プログラミング学習で詰まった時のサポートが不十分', 'AI講師による個別指導、リアルタイム質問対応、学習進捗管理', 'プログラミング初学者', 'エンジニア・プログラミング', ARRAY['プログラミング', '学習', 'AI', 'サポート'], 'in_development', NOW() - INTERVAL '7 days'),
  ('f1234567-89ab-cdef-0123-456789abcdef', '56789abc-def0-1234-5678-9abcdef01234', '地域イベント発見アプリ', '面白い地域イベントの情報が見つけにくい', '位置情報ベースでイベント情報を表示、興味に基づくレコメンド機能', '地域住民、イベント好きな人', 'イベント・エンタメ', ARRAY['イベント', '地域', '位置情報', '発見'], 'open', NOW() - INTERVAL '2 days'),
  ('a0123456-789a-bcde-f012-3456789abcde', '12345678-9abc-def0-1234-56789abcdef0', '料理レシピ提案AI', '冷蔵庫の余り物で何を作ればいいかわからない', '冷蔵庫の中身を撮影するとAIがレシピを提案、栄養バランスも考慮', '料理初心者、忙しい人', 'ライフスタイル', ARRAY['料理', 'AI', 'レシピ', '栄養'], 'completed', NOW() - INTERVAL '15 days'),
  ('b0123456-789a-bcde-f012-3456789abcde', '23456789-abcd-ef01-2345-6789abcdef01', 'ペット健康管理アプリ', 'ペットの健康状態を記録・管理したい', '体重、食事、運動、病院記録を一元管理、異常値アラート機能', 'ペット飼い主', 'ペット・動物', ARRAY['ペット', '健康管理', '記録', 'アラート'], 'open', NOW() - INTERVAL '4 days');

-- 「欲しい！」データ
INSERT INTO wants (idea_id, user_id, created_at) VALUES
  ('a1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', NOW() - INTERVAL '4 days'),
  ('a1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', NOW() - INTERVAL '4 days'),
  ('a1234567-89ab-cdef-0123-456789abcdef', '3456789a-bcde-f012-3456-789abcdef012', NOW() - INTERVAL '3 days'),
  ('a1234567-89ab-cdef-0123-456789abcdef', '456789ab-cdef-0123-4567-89abcdef0123', NOW() - INTERVAL '2 days'),
  ('b1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', NOW() - INTERVAL '3 days'),
  ('b1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', NOW() - INTERVAL '2 days'),
  ('b1234567-89ab-cdef-0123-456789abcdef', '56789abc-def0-1234-5678-9abcdef01234', NOW() - INTERVAL '1 day'),
  ('c1234567-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', NOW() - INTERVAL '9 days'),
  ('c1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', NOW() - INTERVAL '8 days'),
  ('d1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', NOW() - INTERVAL '1 day'),
  ('d1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', NOW() - INTERVAL '1 day'),
  ('e1234567-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', NOW() - INTERVAL '6 days'),
  ('e1234567-89ab-cdef-0123-456789abcdef', '456789ab-cdef-0123-4567-89abcdef0123', NOW() - INTERVAL '5 days'),
  ('e1234567-89ab-cdef-0123-456789abcdef', '56789abc-def0-1234-5678-9abcdef01234', NOW() - INTERVAL '4 days'),
  ('f1234567-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', NOW() - INTERVAL '2 days'),
  ('f1234567-89ab-cdef-0123-456789abcdef', '3456789a-bcde-f012-3456-789abcdef012', NOW() - INTERVAL '1 day'),
  ('a0123456-789a-bcde-f012-3456789abcde', '01234567-89ab-cdef-0123-456789abcdef', NOW() - INTERVAL '14 days'),
  ('a0123456-789a-bcde-f012-3456789abcde', '23456789-abcd-ef01-2345-6789abcdef01', NOW() - INTERVAL '13 days'),
  ('a0123456-789a-bcde-f012-3456789abcde', '456789ab-cdef-0123-4567-89abcdef0123', NOW() - INTERVAL '12 days'),
  ('b0123456-789a-bcde-f012-3456789abcde', '12345678-9abc-def0-1234-56789abcdef0', NOW() - INTERVAL '3 days'),
  ('b0123456-789a-bcde-f012-3456789abcde', '56789abc-def0-1234-5678-9abcdef01234', NOW() - INTERVAL '3 days');

-- コメントデータ
INSERT INTO comments (idea_id, user_id, content, created_at) VALUES
  ('a1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', 'これは素晴らしいアイデアですね！開発してみたいです。音声認識の精度が課題になりそうですが、需要は高いと思います。', NOW() - INTERVAL '4 days'),
  ('a1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', '毎日会議で困っていたので、ぜひ使いたいです！自動要約機能があると更に良いかも。', NOW() - INTERVAL '3 days'),
  ('a1234567-89ab-cdef-0123-456789abcdef', '3456789a-bcde-f012-3456-789abcdef012', 'リモートワークでの会議でも使えそうですね。Zoom連携があると便利そう。', NOW() - INTERVAL '2 days'),
  ('b1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', 'ぜひ使いたいです！レシート撮影機能は便利そう。カテゴリ自動分類もできると嬉しい。', NOW() - INTERVAL '2 days'),
  ('b1234567-89ab-cdef-0123-456789abcdef', '56789abc-def0-1234-5678-9abcdef01234', '家計簿アプリは競合が多いですが、AI分析があるのは差別化になりそうですね。', NOW() - INTERVAL '1 day'),
  ('c1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', '読書好きとしては、とても魅力的なアプリです。既に完成されているなら使ってみたい！', NOW() - INTERVAL '8 days'),
  ('c1234567-89ab-cdef-0123-456789abcdef', '01234567-89ab-cdef-0123-456789abcdef', 'Goodreadsの日本版みたいな感じでしょうか？本のバーコード読み取り機能があると登録が楽そう。', NOW() - INTERVAL '7 days'),
  ('d1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', 'モチベーション維持は確かに課題ですね。友達機能があると続けられそう。', NOW() - INTERVAL '1 day'),
  ('d1234567-89ab-cdef-0123-456789abcdef', '23456789-abcd-ef01-2345-6789abcdef01', 'ジムでの記録にも使えそう。トレーナーとの連携機能があると良いかも。', NOW() - INTERVAL '1 day'),
  ('e1234567-89ab-cdef-0123-456789abcdef', '456789ab-cdef-0123-4567-89abcdef0123', 'プログラミング学習でつまづいた時のサポートは本当に重要ですね。リアルタイム対応が魅力的。', NOW() - INTERVAL '5 days'),
  ('e1234567-89ab-cdef-0123-456789abcdef', '56789abc-def0-1234-5678-9abcdef01234', 'AI講師の質が重要になりそうですが、個別指導は差別化ポイントになりそう。', NOW() - INTERVAL '4 days'),
  ('f1234567-89ab-cdef-0123-456789abcdef', '3456789a-bcde-f012-3456-789abcdef012', '地域イベントの発見は確かに課題です。位置情報ベースなら使いやすそう。', NOW() - INTERVAL '1 day'),
  ('a0123456-789a-bcde-f012-3456789abcde', '23456789-abcd-ef01-2345-6789abcdef01', 'これは便利そう！冷蔵庫の中身管理も一緒にできると更に良いかも。', NOW() - INTERVAL '13 days'),
  ('a0123456-789a-bcde-f012-3456789abcde', '456789ab-cdef-0123-4567-89abcdef0123', '料理のレパートリーが少ないので、ぜひ使ってみたいです。', NOW() - INTERVAL '12 days'),
  ('b0123456-789a-bcde-f012-3456789abcde', '12345678-9abc-def0-1234-56789abcdef0', 'ペットの健康管理は飼い主の関心事ですね。獣医さんとの連携があると心強い。', NOW() - INTERVAL '3 days'),
  ('b0123456-789a-bcde-f012-3456789abcde', '56789abc-def0-1234-5678-9abcdef01234', '複数ペット対応やワクチン管理機能もあると完璧ですね。', NOW() - INTERVAL '3 days');

-- 完成アプリデータ（completedステータスのアイデアに対応）
INSERT INTO completed_apps (id, idea_id, developer_id, app_name, description, app_url, store_urls, screenshots, created_at) VALUES
  ('c0123456-789a-bcde-f012-3456789abcde', 'c1234567-89ab-cdef-0123-456789abcdef', '12345678-9abc-def0-1234-56789abcdef0', 'BookConnect', '読書記録とSNS機能を組み合わせたアプリ。本の感想投稿、フォロー機能、おすすめアルゴリズムを搭載', 'https://bookconnect.app', '{"ios": "https://apps.apple.com/app/bookconnect", "android": "https://play.google.com/store/apps/details?id=com.bookconnect"}', ARRAY['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300'], NOW() - INTERVAL '5 days'),
  ('d0123456-789a-bcde-f012-3456789abcde', 'a0123456-789a-bcde-f012-3456789abcde', '56789abc-def0-1234-5678-9abcdef01234', 'RecipeAI', 'AI技術を活用した料理レシピ提案アプリ。冷蔵庫の材料から最適なレシピを提案し、栄養バランスも管理', 'https://recipeai.app', '{"ios": "https://apps.apple.com/app/recipeai", "android": "https://play.google.com/store/apps/details?id=com.recipeai", "web": "https://recipeai.app"}', ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300', 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=300'], NOW() - INTERVAL '8 days');

-- レビューデータ
INSERT INTO reviews (app_id, user_id, rating, content, created_at) VALUES
  ('c0123456-789a-bcde-f012-3456789abcde', '01234567-89ab-cdef-0123-456789abcdef', 5, '読書記録がとても便利！同じ趣味の人と繋がれるのも嬉しいです。UIも使いやすい。', NOW() - INTERVAL '4 days'),
  ('c0123456-789a-bcde-f012-3456789abcde', '23456789-abcd-ef01-2345-6789abcdef01', 4, '機能は良いのですが、たまにアプリが重くなることがあります。改善を期待しています。', NOW() - INTERVAL '3 days'),
  ('c0123456-789a-bcde-f012-3456789abcde', '3456789a-bcde-f012-3456-789abcdef012', 5, '本の管理がこんなに楽になるとは！レコメンド機能も精度が高くて驚きです。', NOW() - INTERVAL '2 days'),
  ('c0123456-789a-bcde-f012-3456789abcde', '456789ab-cdef-0123-4567-89abcdef0123', 4, '読書モチベーションが上がりました。友達機能で読書仲間も増えて満足です。', NOW() - INTERVAL '1 day'),
  ('d0123456-789a-bcde-f012-3456789abcde', '01234567-89ab-cdef-0123-456789abcdef', 5, '冷蔵庫の余り物活用に重宝してます！AIの提案も的確で料理のレパートリーが増えました。', NOW() - INTERVAL '7 days'),
  ('d0123456-789a-bcde-f012-3456789abcde', '23456789-abcd-ef01-2345-6789abcdef01', 4, 'レシピ提案は便利ですが、もう少し材料のバリエーションがあると嬉しいです。', NOW() - INTERVAL '6 days'),
  ('d0123456-789a-bcde-f012-3456789abcde', '3456789a-bcde-f012-3456-789abcdef012', 5, '栄養バランス表示が素晴らしい！健康的な食事を心がけるきっかけになりました。', NOW() - INTERVAL '5 days'),
  ('d0123456-789a-bcde-f012-3456789abcde', '456789ab-cdef-0123-4567-89abcdef0123', 3, '基本機能は良いのですが、レシート撮影の認識精度が少し気になります。', NOW() - INTERVAL '4 days');

-- サブスクリプションデータ（プレミアムユーザー用）
INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, current_period_start, current_period_end, created_at) VALUES
  ('12345678-9abc-def0-1234-56789abcdef0', 'cus_premium_user_1', 'sub_premium_1', 'active', NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', NOW() - INTERVAL '20 days'),
  ('23456789-abcd-ef01-2345-6789abcdef01', 'cus_premium_user_2', 'sub_premium_2', 'active', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  ('56789abc-def0-1234-5678-9abcdef01234', 'cus_premium_user_3', 'sub_premium_3', 'active', NOW() - INTERVAL '25 days', NOW() + INTERVAL '5 days', NOW() - INTERVAL '25 days');

-- 支払い履歴データ
INSERT INTO payment_history (user_id, stripe_payment_intent_id, amount, currency, status, created_at) VALUES
  ('12345678-9abc-def0-1234-56789abcdef0', 'pi_payment_1', 980, 'jpy', 'succeeded', NOW() - INTERVAL '20 days'),
  ('23456789-abcd-ef01-2345-6789abcdef01', 'pi_payment_2', 980, 'jpy', 'succeeded', NOW() - INTERVAL '15 days'),
  ('56789abc-def0-1234-5678-9abcdef01234', 'pi_payment_3', 980, 'jpy', 'succeeded', NOW() - INTERVAL '25 days'),
  ('12345678-9abc-def0-1234-56789abcdef0', 'pi_payment_4', 980, 'jpy', 'succeeded', NOW() - INTERVAL '50 days'),
  ('23456789-abcd-ef01-2345-6789abcdef01', 'pi_payment_5', 980, 'jpy', 'succeeded', NOW() - INTERVAL '45 days');