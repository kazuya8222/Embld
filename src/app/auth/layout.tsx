import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン - Embld',
  description: 'Embldにログインまたは登録',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  )
}