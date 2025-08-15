import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Owners - 個人開発アプリ掲載プラットフォーム | EmBld',
  description: '個人開発者のプロジェクトを共有し、フィードバックを得る。EmBldのOwnersプラットフォームで、あなたのアプリを世界に発信しましょう。',
};

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}