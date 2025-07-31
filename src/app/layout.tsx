import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'
import { WelcomeModal } from '@/components/common/WelcomeModal'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
})

const notoSansJP = Noto_Sans_JP({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp'
})

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
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans bg-white">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
          <WelcomeModal />
        </AuthProvider>
      </body>
    </html>
  )
}