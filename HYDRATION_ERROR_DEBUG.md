# Embld ハイドレーションエラーの解決

## 発生したエラー

1. **React Error #425**: Text nodes cannot be a child of <tr>
2. **React Error #418**: Hydration failed 
3. **React Error #423**: There was an error while hydrating
4. **404 Error**: /profile/settings not found

## 解決済み

- ✅ `/profile/settings`ページを作成しました

## 考えられる原因と対策

### 1. 日時の表示による不一致
サーバーとクライアントで日時が異なる場合に発生します。

### 2. 条件付きレンダリング
`user`の状態によって表示が変わる部分で発生する可能性があります。

### 3. ローカルストレージの使用
SSR時にはアクセスできないため、エラーの原因になります。

## デバッグ方法

1. **開発環境で確認**
```bash
npm run dev
```
ブラウザのコンソールで詳細なエラーメッセージを確認

2. **特定のページでエラーが発生するか確認**
- トップページ
- アイデア投稿ページ
- プロフィールページ

3. **Next.jsの設定確認**
```json
// next.config.js
module.exports = {
  reactStrictMode: true,
}
```

## 一時的な対処法

最も問題を起こしやすいコンポーネントに`suppressHydrationWarning`を追加：

```tsx
<div suppressHydrationWarning>
  {/* 動的なコンテンツ */}
</div>
```

ただし、これは根本的な解決ではないため、原因を特定して修正することが重要です。