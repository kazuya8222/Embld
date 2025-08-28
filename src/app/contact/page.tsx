'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import Link from 'next/link'
import { submitContact } from '@/app/actions/contact'

export default function ContactPage() {
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

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#e0e0e0] mb-4">お問い合わせ</h1>
          <p className="text-[#a0a0a0] text-lg">
            EMBLDに関するご質問・ご要望をお聞かせください。
          </p>
        </div>

        {/* Contact Form */}
        <section className="mb-12">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            {submitStatus === 'confirm' ? (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-2">送信内容の確認</h2>
                  <p className="text-[#a0a0a0]">以下の内容で送信いたします。内容をご確認ください。</p>
                </div>
                
                {/* 確認内容表示 */}
                <div className="space-y-4 bg-[#1a1a1a] p-6 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-[#a0a0a0] mb-1">お名前</label>
                    <p className="text-[#e0e0e0]">{formData.lastName} {formData.firstName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a0a0a0] mb-1">メールアドレス</label>
                    <p className="text-[#e0e0e0]">{formData.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a0a0a0] mb-1">会社名・組織名</label>
                    <p className="text-[#e0e0e0]">{formData.company || '（未記入）'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a0a0a0] mb-1">お問い合わせ目的</label>
                    <p className="text-[#e0e0e0]">{formData.purpose}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a0a0a0] mb-1">お問い合わせ内容</label>
                    <div className="text-[#e0e0e0] whitespace-pre-wrap">
                      {formData.message}
                    </div>
                  </div>
                </div>

                {/* 確認画面のボタン */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="px-4 py-2 border border-[#3a3a3a] text-[#e0e0e0] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                  >
                    内容を修正する
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all ${
                      isSubmitting 
                        ? 'bg-[#4a4a4a] cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        送信する
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-2">送信完了</h2>
                <p className="text-[#a0a0a0]">
                  お問い合わせありがとうございます。<br />
                  内容を確認の上、3営業日以内に担当者よりご連絡させていただきます。
                </p>
                <Link
                  href="/home"
                  className="inline-block mt-4 px-4 py-2 bg-[#3a3a3a] text-[#e0e0e0] rounded-lg hover:bg-[#4a4a4a] transition-colors"
                >
                  ホームに戻る
                </Link>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-2">送信エラー</h2>
                <p className="text-[#a0a0a0] mb-4">
                  申し訳ございません。送信中にエラーが発生しました。<br />
                  しばらく時間をおいて再度お試しください。
                </p>
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  再試行
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#e0e0e0] mb-2">
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
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#6a6a6a]"
                    />
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#e0e0e0] mb-2">
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
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#6a6a6a]"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#e0e0e0] mb-2">
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
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#6a6a6a]"
                  />
                </div>

                {/* Company Field (Optional) */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-[#e0e0e0] mb-2">
                    会社名・組織名（任意）
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="株式会社〇〇"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#6a6a6a]"
                  />
                </div>

                {/* Purpose Field */}
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-[#e0e0e0] mb-2">
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
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-[#6a6a6a]"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#e0e0e0] mb-2">
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
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none placeholder-[#6a6a6a]"
                  />
                </div>

                {/* Privacy Policy Notice */}
                <div className="text-sm text-[#a0a0a0]">
                  送信いただいた内容は、<Link href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline">プライバシーポリシー</Link>に基づいて適切に管理いたします。
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all ${
                      isSubmitting 
                        ? 'bg-[#4a4a4a] cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        送信中...
                      </>
                    ) : (
                      '確認画面へ'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* その他の情報 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">その他の情報</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 space-y-4">
            <p className="text-[#c0c0c0]">
              よくあるご質問については、<Link href="/#faq" className="text-blue-400 hover:text-blue-300 underline">FAQセクション</Link>をご確認ください。
            </p>
            <p className="text-[#c0c0c0]">
              サービスの使い方については、<Link href="/help" className="text-blue-400 hover:text-blue-300 underline">ヘルプページ</Link>をご覧ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}