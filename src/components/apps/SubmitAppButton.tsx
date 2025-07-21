'use client'

import { useState } from 'react'
import { Rocket, Plus } from 'lucide-react'
import { AppSubmissionModal } from './AppSubmissionModal'
import { submitApp } from '@/app/actions/submitApp'

interface SubmitAppButtonProps {
  ideaId: string
  ideaTitle: string
  isAuthenticated: boolean
  variant?: 'primary' | 'secondary'
  className?: string
}

export function SubmitAppButton({ 
  ideaId, 
  ideaTitle, 
  isAuthenticated, 
  variant = 'primary',
  className = '' 
}: SubmitAppButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // baseButtonClassを最初に定義
  const baseButtonClass = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const handleSubmit = async (formData: FormData) => {
    if (!isAuthenticated) {
      throw new Error('ログインが必要です')
    }
    
    const result = await submitApp(formData)
    if (!result.success) {
      throw new Error('アプリの投稿に失敗しました')
    }
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }
    setIsModalOpen(true)
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleClick}
        className={`${baseButtonClass} bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg ${className}`}
      >
        <Rocket className="w-5 h-5" />
        アプリを投稿
      </button>
    )
  }
  
  const buttonClass = variant === 'primary' 
    ? `${baseButtonClass} bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-lg` 
    : `${baseButtonClass} bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-500`

  return (
    <>
      <button
        onClick={handleClick}
        className={`${buttonClass} ${className}`}
      >
        {variant === 'primary' ? (
          <Rocket className="w-5 h-5" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
        アプリを投稿
      </button>

      <AppSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ideaId={ideaId}
        ideaTitle={ideaTitle}
        onSubmit={handleSubmit}
      />
    </>
  )
}