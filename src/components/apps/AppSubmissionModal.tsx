'use client'

import { useState, useEffect } from 'react'
import { X, Rocket } from 'lucide-react'
import { AppSubmissionForm } from './AppSubmissionForm'

interface AppSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  ideaId: string
  ideaTitle: string
  onSubmit: (formData: FormData) => Promise<void>
}

export function AppSubmissionModal({ isOpen, onClose, ideaId, ideaTitle, onSubmit }: AppSubmissionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isSubmitting])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false)
      setSubmitStatus('idle')
    }
  }, [isOpen])

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      await onSubmit(formData)
      setSubmitStatus('success')
      
      // Auto-close modal after successful submission
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error submitting app:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Rocket className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                アプリを投稿
              </h2>
              <p className="text-sm text-gray-600">
                「{ideaTitle}」のアイデアから開発したアプリを投稿しましょう
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                投稿が完了しました！
              </h3>
              <p className="text-gray-600">
                アプリが正常に投稿されました。アイデア詳細ページに表示されます。
              </p>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                投稿に失敗しました
              </h3>
              <p className="text-gray-600 mb-4">
                申し訳ございませんが、投稿処理中にエラーが発生しました。
              </p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                再試行
              </button>
            </div>
          ) : (
            <AppSubmissionForm
              ideaId={ideaId}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}