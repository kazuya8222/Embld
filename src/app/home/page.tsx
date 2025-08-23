'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/ChatInterface'

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'question' | 'result'>('welcome')

  // 画面状態に応じてレイアウトの表示/非表示を制御
  useEffect(() => {
    const showLayout = currentScreen === 'welcome'
    
    // レイアウトの表示状態を親レイアウトに通知
    window.dispatchEvent(new CustomEvent('toggleHomeLayout', {
      detail: { show: showLayout }
    }))
  }, [currentScreen])

  return <ChatInterface onScreenChange={setCurrentScreen} />
}
