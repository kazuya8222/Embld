import { IdeaSubmissionSelector } from '@/components/ideas/IdeaSubmissionSelector'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アイデア投稿 - Embld',
  description: 'あなたのアイデアを投稿しましょう',
}

// 静的生成でページを高速化 - 認証チェックはクライアントサイドで実行
export default function NewIdeaPage() {
  return <IdeaSubmissionSelector />
}