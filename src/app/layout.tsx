import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'

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
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}