import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { LoadingProvider } from '@/components/loading/LoadingProvider'
import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  preload: false
})

const notoSansJP = Noto_Sans_JP({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: false
})

export const metadata: Metadata = {
  title: 'EmBld - アイデアを実現する開発パートナー',
  description: 'あなたのアプリアイデアをEmBldチームが開発。収益の20%をアイデア投稿者に還元するプラットフォーム',
  icons: {
    icon: [
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon_16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon_32x32.png" />
        <link rel="icon" type="image/png" sizes="180x180" href="/images/favicon_180x180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon_180x180.png" />
      </head>
      <body className="font-sans bg-gray-950">
        <AuthProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}