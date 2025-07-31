# Supabase 新規登録問題の解決手順

## 1. Supabaseダッシュボードで確認すること

### Authentication設定
1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン
2. プロジェクトを選択
3. 左メニューから「Authentication」を選択
4. 以下を確認：

#### a. Email認証の設定
- Settings → Providers → Email
  - ✅ Enable Email provider がONになっているか
  - ✅ Confirm email がONになっているか（推奨）
  - ✅ Email Templates が正しく設定されているか

#### b. Google OAuth設定（使用する場合）
- Settings → Providers → Google
  - ✅ Enable Sign in with Google がONになっているか
  - ✅ Google Cloud Console でOAuth2.0クライアントIDを作成済みか
  - ✅ Authorized redirect URIs に以下を追加済みか：
    - `https://arnchxwpxpibbhxvdnov.supabase.co/auth/v1/callback`
    - `http://localhost:3000/auth/callback`（開発環境）

#### c. URL Configuration
- Settings → URL Configuration
  - ✅ Site URL: `http://localhost:3000`（開発環境）
  - ✅ Redirect URLs に以下が含まれているか：
    - `http://localhost:3000/auth/callback`

## 2. データベーススキーマの修正

1. Supabase Dashboard → SQL Editor を開く
2. `fix_users_table.sql` の内容を実行
3. エラーがないか確認

## 3. ローカル環境でのテスト

1. 開発サーバーを再起動：
```bash
npm run dev
```

2. ブラウザのDevToolsを開いて、Consoleタブを確認
3. 新規登録を試みて、エラーメッセージを確認

## 4. よくあるエラーと対処法

### "User already registered"
- 同じメールアドレスで既に登録されている
- 解決: 別のメールアドレスを使用するか、Supabaseダッシュボードでユーザーを削除

### "Invalid email or password"
- パスワードが6文字未満
- 解決: 6文字以上のパスワードを使用

### "Database error"
- usersテーブルのスキーマが正しくない
- 解決: fix_users_table.sqlを実行

### タイムアウトエラー
- Supabaseへの接続が遅い
- 解決: VPNを切断してみる、ネットワーク環境を確認

## 5. デバッグ用コード

RegisterForm.tsxに以下のデバッグコードを追加して詳細なエラーを確認：

```typescript
// signUp直後に追加
console.log('Auth response:', {
  user: authData?.user,
  session: authData?.session,
  error: authError
});

// プロフィール作成前に追加
if (authData?.user) {
  console.log('Checking if user exists in public.users...');
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();
  console.log('Existing user:', existingUser);
}
```