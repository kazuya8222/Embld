'use client'

import { useState } from 'react'
import { ArrowLeft, Send, Mail, MessageSquare, User, Building } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { submitContact } from '@/app/actions/contact'

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
        setFormData({
          name: '',
          email: '',
          company: '',
          category: 'general',
          message: ''
        })
      }, 3000)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/home" className="flex items-center space-x-3">
              <img 
                src="/images/EnBld_logo_icon_monochrome.svg"
                alt="EMBLD Icon"
                className="h-10 w-10 brightness-0 invert"
              />
              <span className="text-2xl font-black text-white">EMBLD</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          href="/home" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
          <p className="text-lg text-gray-600">
            ご質問・ご要望・ご意見など、お気軽にお問い合わせください
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">送信完了</h2>
              <p className="text-gray-600">
                お問い合わせありがとうございます。<br />
                内容を確認の上、担当者よりご連絡させていただきます。
              </p>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">送信エラー</h2>
              <p className="text-gray-600">
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
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  お問い合わせ種別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="general">一般的なお問い合わせ</option>
                  <option value="idea">アイデア・企画について</option>
                  <option value="development">開発について</option>
                  <option value="business">ビジネス提携について</option>
                  <option value="bug">不具合報告</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="山田 太郎"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Company Field (Optional) */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  会社名・組織名（任意）
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="株式会社〇〇"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline w-4 h-4 mr-1" />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Privacy Policy Agreement */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
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
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      送信する
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">営業時間</h3>
            <p className="text-gray-600">
              平日: 10:00 - 18:00<br />
              土日祝日: 休業
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ※お問い合わせへの返信は営業時間内に順次対応いたします
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">よくあるご質問</h3>
            <p className="text-gray-600">
              お問い合わせの前に、<a href="/#faq" onClick={handleFaqClick} className="text-blue-600 hover:underline cursor-pointer">よくある質問</a>をご確認ください。
              多くのご質問への回答が掲載されています。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}