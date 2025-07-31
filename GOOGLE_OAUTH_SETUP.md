# Google OAuth 設定完全ガイド

## 開発環境での設定

### 1. Google Cloud Console設定
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 「APIとサービス」→「認証情報」→「+ 認証情報を作成」→「OAuth クライアント ID」
3. OAuth同意画面の設定（初回のみ）
   - ユーザータイプ: 外部
   - アプリ名: Embld
   - ユーザーサポートメール: あなたのメールアドレス
   - 開発者連絡先: あなたのメールアドレス
   - スコープ: email, profile

4. OAuthクライアントIDの作成
   - アプリケーションの種類: ウェブアプリケーション
   - 名前: Embld Development（任意）
   - 承認済みのリダイレクトURI:
     ```
     https://arnchxwpxpibbhxvdnov.supabase.co/auth/v1/callback
     ```

### 2. Supabaseダッシュボード設定
1. [Supabase Dashboard](https://supabase.com/dashboard) → プロジェクト選択
2. Authentication → Providers → Google
3. 設定:
   - Enable Sign in with Google: ON
   - Client ID: [Google Consoleで取得したID]
   - Client Secret: [Google Consoleで取得したシークレット]

4. Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000
     ```

### 3. テスト手順
1. 開発サーバーを起動
   ```bash
   npm run dev
   ```

2. デバッグページでテスト
   ```
   http://localhost:3000/debug
   ```
   - 「Test Google Sign In」ボタンをクリック

3. 通常の登録ページでテスト
   ```
   http://localhost:3000/auth/register
   ```
   - 「Googleで登録」ボタンをクリック

## 本番環境での設定（Vercelデプロイ時）

### 1. Google Cloud Consoleに本番URLを追加
承認済みのリダイレクトURIに追加:
```
https://your-app.vercel.app/auth/callback
```

### 2. SupabaseのURL設定を更新
- Site URL: `https://your-app.vercel.app`
- Redirect URLs に追加:
  ```
  https://your-app.vercel.app/auth/callback
  https://your-app.vercel.app
  ```

### 3. Vercel環境変数
Vercelダッシュボードで環境変数を設定:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## トラブルシューティング

### エラー: "redirect_uri_mismatch"
- Google ConsoleのリダイレクトURIが正しく設定されていない
- URLの末尾のスラッシュの有無を確認
- httpとhttpsの違いを確認

### エラー: "Invalid request"
- Client IDまたはClient Secretが正しくない
- Supabaseダッシュボードで再度確認

### エラー: "User already registered"
- 同じGoogleアカウントで既に登録済み
- Supabaseダッシュボードでユーザーを確認

### ユーザープロフィールが作成されない
- `src/app/auth/callback/route.ts`のエラーログを確認
- RLSポリシーを確認（fix_users_table.sqlを実行済みか）

## セキュリティの注意点
- Client Secretは絶対に公開しないこと
- 本番環境では必ずHTTPSを使用すること
- OAuth同意画面は本番リリース前に「本番」に変更すること