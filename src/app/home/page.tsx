'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'question' | 'result'>('welcome')

  // Welcome画面の時だけヘッダー・フッターを表示
  if (currentScreen === 'welcome') {
    return (
      <>
        <Navigation />
        <ChatInterface onScreenChange={setCurrentScreen} />
        <Footer />
      </>
    )
  }

  // 質問・結果画面では全画面表示
  return <ChatInterface onScreenChange={setCurrentScreen} />
}
