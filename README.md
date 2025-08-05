# embldプロジェクト構造ドキュメント

## 📋 プロジェクト概要

**embld**は「こんなアプリ欲しい」と「何か作りたい」をつなぐアイデア共有プラットフォームです。ユーザーはアプリのアイデアを投稿し、開発者はそれらのアイデアを実装できます。

### 主な機能
- アイデアの投稿・編集・削除
- 「欲しい！」ボタンによる需要の可視化
- コメント機能によるディスカッション
- 完成アプリの投稿とレビュー

### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth (メール/パスワード、Google OAuth)
- **決済**: Stripe
- **ホスティング**: Vercel

## 🗂 ディレクトリ構造

```
embld/
├── src/                          # ソースコード
│   ├── app/                      # Next.js App Router
│   ├── components/               # Reactコンポーネント
│   ├── lib/                      # ライブラリ設定とユーティリティ
│   ├── types/                    # TypeScript型定義
│   ├── data/                     # 静的データ
│   ├── hooks/                    # カスタムReactフック
│   └── middleware.ts             # Next.jsミドルウェア
├── public/                       # 静的ファイル
├── migrations/                   # データベースマイグレーション
├── scripts/                      # ビルド・デプロイスクリプト
└── [設定ファイル]                # package.json, tsconfig.json等
```

## 📁 詳細なファイル構造と役割

### 1. app/ ディレクトリ（ページとルーティング）

#### ルートレイアウトとページ
- `app/layout.tsx` - アプリケーション全体のルートレイアウト
- `app/page.tsx` - ランディングページ（/）
- `app/globals.css` - グローバルCSS（Tailwind CSSの設定）
- `app/loading.tsx` - ルートレベルのローディングUI

#### 認証関連 (/auth)
- `auth/layout.tsx` - 認証ページ共通レイアウト
- `auth/login/page.tsx` - ログインページ
- `auth/register/page.tsx` - 新規登録ページ
- `auth/setup/page.tsx` - 初回ログイン時のプロフィール設定
- `auth/callback/route.ts` - OAuth認証のコールバック処理
- `auth/actions/index.ts` - 認証関連のServer Actions

#### ホームページ (/home)
- `home/page.tsx` - ログイン後のホーム画面
- `home/layout.tsx` - ホーム画面のレイアウト
- `home/loading.tsx` - ホーム画面のローディングUI

#### メインアプリケーション (/(app))
グループルートを使用した認証必須エリア：

**アイデア関連**
- `(app)/ideas/new/page.tsx` - 新規アイデア投稿
- `(app)/ideas/[id]/page.tsx` - アイデア詳細表示
- `(app)/ideas/[id]/edit/page.tsx` - アイデア編集

**アプリ関連**
- `(app)/apps/page.tsx` - 完成アプリ一覧
- `(app)/apps/[id]/page.tsx` - アプリ詳細とレビュー

**プロフィール関連**
- `(app)/profile/page.tsx` - ユーザープロフィール
- `(app)/profile/ideas/page.tsx` - 自分の投稿したアイデア
- `(app)/profile/wants/page.tsx` - 「欲しい！」したアイデア
- `(app)/profile/settings/page.tsx` - アカウント設定

**管理者機能**
- `(app)/admin/apps/page.tsx` - アプリ投稿の管理

**法務関連**
- `(app)/legal/terms/page.tsx` - 利用規約
- `(app)/legal/privacy/page.tsx` - プライバシーポリシー

#### APIルート (/api)
- `api/stripe/webhook/route.ts` - Stripe Webhookの処理
- `api/stripe/create-checkout-session/route.ts` - 決済セッション作成
- `api/stripe/create-portal-session/route.ts` - 顧客ポータルセッション作成

#### その他
- `actions/submitApp.ts` - アプリ投稿のServer Action
- `debug/` - 開発用デバッグページ

### 2. components/ ディレクトリ（UIコンポーネント）

#### 共通コンポーネント (/common)
- `Navigation.tsx` - ヘッダーナビゲーション
- `Footer.tsx` - フッター
- `PostIdeaButton.tsx` - アイデア投稿ボタン
- `WantButton.tsx` - 「欲しい！」ボタン
- `CommentSection.tsx` - コメントセクション

#### 認証コンポーネント (/auth)
- `AuthProvider.tsx` - 認証状態管理のContextProvider
- `LoginForm.tsx` - ログインフォーム
- `RegisterForm.tsx` - 新規登録フォーム
- `SetupForm.tsx` - プロフィール設定フォーム
- `AuthSyncTrigger.tsx` - 認証状態の同期

#### アイデア関連コンポーネント (/ideas)
- `IdeaForm.tsx` - アイデア投稿・編集フォーム
- `IdeaCard.tsx` - アイデアカード（一覧表示用）
- `CardIdeaItem.tsx` - カード形式のアイデア表示
- `ProductHuntIdeaItem.tsx` - ProductHunt風のアイデア表示

#### アプリ関連コンポーネント (/apps)
- `AppCard.tsx` - アプリカード（一覧表示用）
- `AppSubmissionForm.tsx` - アプリ投稿フォーム
- `AppSubmissionModal.tsx` - アプリ投稿モーダル
- `AdminAppSubmissionForm.tsx` - 管理者用アプリ投稿フォーム
- `ReviewSection.tsx` - レビューセクション
- `SubmitAppButton.tsx` - アプリ投稿ボタン

#### その他
- `ScrollFadeIn.tsx` - スクロールフェードインアニメーション
- `home/HomePageClient.tsx` - ホームページのクライアントコンポーネント
- `loading/` - ローディング関連コンポーネント
- `debug/` - デバッグ用コンポーネント

### 3. lib/ ディレクトリ（ライブラリとユーティリティ）

#### Supabase設定 (/supabase)
- `client.ts` - ブラウザ用Supabaseクライアント
- `server.ts` - サーバーコンポーネント用Supabaseクライアント
- `middleware.ts` - ミドルウェア用Supabaseクライアント
- `direct-client.ts` - REST API直接呼び出し用クライアント（タイムアウト対策）
- `database.types.ts` - データベーススキーマの型定義

#### Stripe設定 (/stripe)
- `client.ts` - ブラウザ用Stripeクライアント
- `server.ts` - サーバー用Stripeクライアント

#### ユーティリティ (/utils)
- `cn.ts` - クラス名結合ユーティリティ（clsx + tailwind-merge）
- `env.ts` - 環境変数取得ユーティリティ

### 4. その他の重要ファイル

#### 型定義
- `types/index.ts` - アプリケーション全体の型定義（User, Idea, App等）

#### ミドルウェア
- `middleware.ts` - 認証チェックとルート保護

#### データベース関連
- `migrations/` - データベースマイグレーションファイル

#### 設定ファイル
- `.env.local.example` - 環境変数のテンプレート
- `package.json` - プロジェクト依存関係
- `tsconfig.json` - TypeScript設定
- `tailwind.config.ts` - Tailwind CSS設定
- `next.config.js` - Next.js設定

## 🔄 処理フローと主要機能

### 1. 認証フロー
```
1. ユーザーアクセス → middleware.tsで認証チェック
2. 未認証の場合 → /auth/loginへリダイレクト
3. ログイン方法：
   - メール/パスワード認証
   - Google OAuth認証
4. 初回ログイン → /auth/setupでプロフィール設定
5. 認証済み → /homeへリダイレクト
```

### 2. アイデア投稿フロー
```
1. /ideas/new → IdeaFormコンポーネント
2. フォーム入力（タイトル、問題、解決策等）
3. directSupabaseクライアントでDB保存
4. 投稿完了 → アイデア詳細ページへ
```

### 3. 決済フロー（プレミアム会員）
```
1. プレミアム機能へアクセス
2. Stripeチェックアウトセッション作成
3. 決済完了 → Webhook経由でユーザー情報更新
4. is_premium: true に更新
```

### 4. アプリ投稿フロー
```
1. アイデアから「アプリを作る」ボタン
2. AppSubmissionFormで情報入力
3. 管理者承認（admin/apps）
4. アプリ一覧に表示
```

## 🔐 セキュリティと認証

- **ミドルウェア**: 保護されたルートへのアクセス制御
- **Supabase RLS**: データベースレベルでのアクセス制御
- **Server Actions**: サーバーサイドでの安全なデータ操作
- **環境変数**: APIキーとシークレットの安全な管理

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# TypeScriptビルドチェック
npm run type-check

# 本番ビルド
npm run build

# リント実行
npm run lint
```

## 📝 メンテナンスのポイント

1. **新機能追加時**：
   - 型定義を`types/index.ts`に追加
   - 必要に応じてデータベーススキーマを更新
   - Server ActionsまたはAPI Routeを作成

2. **コンポーネント作成時**：
   - 適切なディレクトリに配置（共通/機能別）
   - クライアントコンポーネントには`'use client'`を付与
   - Supabaseクライアントは用途に応じて選択

3. **エラーハンドリング**：
   - try-catchでエラーをキャッチ
   - ユーザーへの適切なフィードバック
   - エラーログの記録