-- 既存のusersテーブルを修正
-- 注意: このスクリプトは既存のデータを削除します。本番環境では慎重に実行してください。

-- 1. 外部キー制約を一時的に無効化（必要に応じて）
-- 2. usersテーブルを再作成

-- まず既存のテーブルをバックアップ（必要に応じて）
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- 関連するテーブルの外部キー制約を削除
ALTER TABLE ideas DROP CONSTRAINT IF EXISTS ideas_user_id_fkey;
ALTER TABLE wants DROP CONSTRAINT IF EXISTS wants_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE completed_apps DROP CONSTRAINT IF EXISTS completed_apps_developer_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE payment_history DROP CONSTRAINT IF EXISTS payment_history_user_id_fkey;

-- usersテーブルを削除して再作成
DROP TABLE IF EXISTS users CASCADE;

-- usersテーブルを再作成（idをauth.users()のidと一致させる）
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  google_avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  is_developer BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 外部キー制約を再設定
ALTER TABLE ideas ADD CONSTRAINT ideas_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wants ADD CONSTRAINT wants_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE completed_apps ADD CONSTRAINT completed_apps_developer_id_fkey 
  FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE payment_history ADD CONSTRAINT payment_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- RLSポリシーを再設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーポリシー
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 新規ユーザー作成のポリシーを追加
CREATE POLICY "Users can insert own profile on signup" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- auth.usersテーブルに新規ユーザーが作成されたときに、
-- 自動的にpublic.usersテーブルにもレコードを作成するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, auth_provider)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_app_meta_data->>'provider', 'email')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のトリガーを削除して再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();