import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthSyncTrigger } from '@/components/auth/AuthSyncTrigger'
import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'
import { WelcomeModal } from '@/components/common/WelcomeModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EmBld - アイデアを実現する開発パートナー',
  description: 'あなたのアプリアイデアをEmBldチームが開発。収益の20%をアイデア投稿者に還元するプラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <AuthSyncTrigger />
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              {children}
            </main>
            <Footer />
          </div>
          <WelcomeModal />
        </AuthProvider>
      </body>
    </html>
  )
}