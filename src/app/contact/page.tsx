'use client'

import { useState } from 'react'
import { ArrowLeft, Send, Mail, MessageSquare, User, Building } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { submitContact } from '@/app/actions/contact'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    company: '',
    purpose: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'confirm' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('confirm')
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await submitContact(formData)

      if (!result.success) {
        console.error('Error saving contact:', result.error)
        setIsSubmitting(false)
        setSubmitStatus('error')
        return
      }

      setIsSubmitting(false)
      setSubmitStatus('success')
    } catch (error) {
      console.error('Unexpected error:', error)
      setIsSubmitting(false)
      setSubmitStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push('/?scrollTo=faq')
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0]">
      {/* Header */}
      <header className="bg-[#2a2a2a] border-b border-[#3a3a3a] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/home" className="flex items-center space-x-3">
              <img 
                src="/images/EnBld_logo_icon_monochrome.svg"
                alt="EMBLD Icon"
                className="h-10 w-10 brightness-0 invert"
              />
              <span className="text-2xl font-black text-[#e0e0e0]">EMBLD</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          href="/home" 
          className="inline-flex items-center gap-2 text-[#a0a0a0] hover:text-[#e0e0e0] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#e0e0e0] mb-4">お問い合わせ</h1>
        </div>

        {/* Contact Form */}
        <div className="bg-[#2a2a2a] rounded-2xl shadow-xl border border-[#3a3a3a] p-8">
          {submitStatus === 'confirm' ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#e0e0e0] mb-2">送信内容の確認</h2>
                <p className="text-[#a0a0a0]">以下の内容で送信いたします。内容をご確認ください。</p>
              </div>
              
              {/* 確認内容表示 */}
              <div className="space-y-4 bg-[#1a1a1a] p-6 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">お名前</label>
                  <p className="text-[#e0e0e0] bg-[#2a2a2a] p-2 rounded border border-[#3a3a3a]">{formData.lastName} {formData.firstName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">メールアドレス</label>
                  <p className="text-[#e0e0e0] bg-[#2a2a2a] p-2 rounded border border-[#3a3a3a]">{formData.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">会社名・組織名</label>
                  <p className="text-[#e0e0e0] bg-[#2a2a2a] p-2 rounded border border-[#3a3a3a]">{formData.company || '（未記入）'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">お問い合わせ目的</label>
                  <p className="text-[#e0e0e0] bg-[#2a2a2a] p-2 rounded border border-[#3a3a3a]">{formData.purpose}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">お問い合わせ内容</label>
                  <div className="text-[#e0e0e0] bg-[#2a2a2a] p-3 rounded border border-[#3a3a3a] whitespace-pre-wrap">
                    {formData.message}
                  </div>
                </div>
              </div>

              {/* 確認画面のボタン */}
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="px-6 py-3 border border-[#3a3a3a] text-[#e0e0e0] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  内容を修正する
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all ${
                    isSubmitting 
                      ? 'bg-[#4a4a4a] cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "送信する"
                  )}
                </button>
              </div>
            </div>
          ) : submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#e0e0e0] mb-2">送信完了</h2>
              <p className="text-[#a0a0a0]">
                お問い合わせありがとうございます。<br />
                内容を確認の上、3営業日以内に担当者よりご連絡させていただきます。
              </p>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#e0e0e0] mb-2">送信エラー</h2>
              <p className="text-[#a0a0a0]">
                申し訳ございません。送信中にエラーが発生しました。<br />
                しばらく時間をおいて再度お試しください。
              </p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                再試行
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    姓 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="山田"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#a0a0a0]"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="太郎"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#a0a0a0]"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#a0a0a0]"
                />
              </div>

              {/* Company Field (Optional) */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  会社名・組織名（任意）
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="株式会社〇〇"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#a0a0a0]"
                />
              </div>

              {/* Purpose Field */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  お問い合わせ目的 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="例: サービスについての質問、ビジネス提携、不具合報告など"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#a0a0a0]"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="お問い合わせ内容をご記入ください..."
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none placeholder-[#a0a0a0]"
                />
              </div>

              {/* Privacy Policy Agreement */}
              <div className="bg-[#1a1a1a] p-4 rounded-lg">
                <p className="text-sm text-[#a0a0a0]">
                  送信いただいた内容は、<Link href="/legal/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>に基づいて適切に管理いたします。
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 ${
                    isSubmitting 
                      ? 'bg-[#4a4a4a] cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "確認画面へ"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-12">
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#3a3a3a]">
            <h3 className="font-bold text-[#e0e0e0] mb-4">よくあるご質問</h3>
            <p className="text-[#a0a0a0]">
              お問い合わせの前に、<a href="/#faq" onClick={handleFaqClick} className="text-blue-600 hover:underline cursor-pointer">よくある質問</a>をご確認ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}