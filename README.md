# IdeaSpark - アイデア→アプリ マッチングプラットフォーム

「こんなアプリ欲しい」と「何か作りたい」をつなぐシンプルな掲示板

## 機能

### ✨ 主要機能
- **アイデア投稿**: 問題と解決策を投稿してアプリのアイデアを共有
- **「欲しい！」機能**: アイデアに対する需要を可視化
- **コメント機能**: アイデアについてディスカッション
- **完成アプリ投稿**: 実装されたアプリを紹介
- **レビュー機能**: 完成アプリの評価とレビュー

### 🔐 認証
- メールアドレス認証
- Google OAuth認証

### 💎 プレミアム機能（月額500円）
- 「欲しい！」ユーザーリストの詳細
- アイデアの分析データ
- ユーザー属性分析
- プレミアムバッジ

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage
- **決済**: Stripe
- **ホスティング**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして以下の値を設定してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseの設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `supabase_schema.sql` の内容をSQL Editorで実行
3. Settings > API から URL と anon key を取得
4. Settings > Database から service role key を取得

### 4. Stripeの設定

1. [Stripe](https://stripe.com) でアカウントを作成
2. テスト環境の API keys を取得
3. 月額サブスクリプション商品を作成して price ID を取得
4. Webhook エンドポイント `your-domain/api/stripe/webhook` を設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ
│   ├── auth/              # 認証関連ページ
│   ├── ideas/             # アイデア関連ページ
│   ├── apps/              # 完成アプリ関連ページ
│   ├── profile/           # プロフィールページ
│   ├── premium/           # プレミアムページ
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
│   ├── auth/              # 認証コンポーネント
│   ├── ideas/             # アイデア関連コンポーネント
│   ├── apps/              # アプリ関連コンポーネント
│   └── common/            # 共通コンポーネント
├── lib/                   # ユーティリティ
│   ├── supabase/          # Supabase設定
│   ├── stripe/            # Stripe設定
│   └── utils/             # ヘルパー関数
└── types/                 # TypeScript型定義
```

## デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com) でアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

### データベースの移行

本番環境のSupabaseで `supabase_schema.sql` を実行してください。

## 開発時のコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# 型チェック
npm run type-check
```

## サンプルデータ

`supabase_schema.sql` には以下のサンプルデータが含まれています：

- 3つのサンプルユーザー
- 3つのサンプルアイデア
- 「欲しい！」とコメントのサンプルデータ

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubのIssuesで報告してください。