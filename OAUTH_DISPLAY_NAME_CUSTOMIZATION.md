# SupabaseでOAuth表示名をカスタマイズする方法

## 確認すべき設定

### 1. Supabase Dashboard での設定
1. Project Settings → General
   - **Project name**: ここを「Embld」に設定
   - これがOAuth画面に表示される可能性があります

### 2. Google Cloud Console での設定変更
実は、Google側でも設定を調整できます：

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 「APIとサービス」→「OAuth同意画面」
3. 以下を編集：
   - **アプリ名**: Embld
   - **ユーザーサポートメール**: あなたのメール
   - **アプリのロゴ**: Embldのロゴをアップロード（オプション）

## 重要な注意点

### 現在の表示
```
Google は、あなたに関する情報へのアクセスを arnchxwpxpibbhxvdnov.supabase.co に許可します
```

### 改善できる部分
- ❌ ドメイン部分（arnchxwpxpibbhxvdnov.supabase.co）は変更不可
- ✅ アプリ名やロゴは変更可能
- ✅ 同意画面の説明文は編集可能

## 代替案：カスタムドメインの使用

### Option 1: Supabase のカスタムドメイン機能（Pro以上のプラン）
```
auth.embld.com → arnchxwpxpibbhxvdnov.supabase.co
```

### Option 2: 完全な独自実装
NextAuth.jsなどを使用して、Supabaseを経由しない認証フローを実装

## 当面の対応案

1. **Google Cloud Console で OAuth同意画面を編集**
   - アプリ名を「Embld」に設定
   - ロゴを追加
   - 説明文を追加

2. **ユーザーへの説明を追加**
   登録画面に以下のような説明を追加：
   ```
   ※ Google認証画面では「arnchxwpxpibbhxvdnov.supabase.co」と
   表示されますが、これはEmbldが使用している認証サービスです。
   安全にご利用いただけます。
   ```

3. **将来的な移行計画**
   - MVP完成後、必要に応じて独自認証に移行
   - またはSupabase Proプランでカスタムドメインを設定