-- 通知テーブルの作成
CREATE TABLE IF NOT EXISTS owner_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES owner_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES owner_post_comments(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_owner_notifications_recipient_id ON owner_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_created_at ON owner_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_owner_notifications_is_read ON owner_notifications(is_read);

-- RLSポリシーの設定
ALTER TABLE owner_notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分宛ての通知のみ閲覧可能
CREATE POLICY "Users can view their own notifications" ON owner_notifications
    FOR SELECT USING (auth.uid() = recipient_id);

-- ユーザーは自分宛ての通知のみ更新可能（既読状態の変更など）
CREATE POLICY "Users can update their own notifications" ON owner_notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- 通知の作成は認証されたユーザーのみ可能
CREATE POLICY "Authenticated users can create notifications" ON owner_notifications
    FOR INSERT WITH CHECK (auth.uid() = sender_id);