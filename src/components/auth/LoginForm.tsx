'use client'

import { loginWithGoogle, loginWithApple } from '@/app/auth/actions'
import { cn } from '@/lib/utils/cn'
import { useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const [isPending, startTransition] = useTransition()

  return (
    <div className="w-full max-w-md mx-auto space-y-8 px-6">
      {/* Top Left Logo */}
      <div className="fixed top-8 left-8">
        <div className="flex items-center space-x-3">
          <img 
            src="/images/EnBld_logo_icon_monochrome.svg"
            alt="EMBLD Icon"
            className="w-8 h-8 brightness-0 invert"
          />
          <span className="text-white font-semibold text-xl">EMBLD</span>
        </div>
      </div>

      {/* Center Logo */}
      <div className="text-center">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8">
          <img 
            src="/images/EnBld_logo_icon_monochrome.svg"
            alt="EMBLD Icon"
            className="w-12 h-12 brightness-0 invert"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">EMBLDにログイン</h1>
        <p className="text-gray-400 text-sm">アイデアを共有し、今すぐ作成を始めましょう</p>
      </div>

      <div className="space-y-4">
        {/* Google Login */}
        <form 
          action={(formData) => {
            startTransition(() => {
              loginWithGoogle()
            })
          }}
        >
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl transition-all duration-200 text-white font-medium border border-[#3a3a3a] hover:border-[#4a4a4a]",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isPending ? 'ログイン中...' : 'Googleでサインアップ'}
          </button>
        </form>
        
        {/* Apple Login */}
        <form 
          action={(formData) => {
            startTransition(() => {
              loginWithApple()
            })
          }}
        >
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl transition-all duration-200 text-white font-medium border border-[#3a3a3a] hover:border-[#4a4a4a]",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            {isPending ? 'ログイン中...' : 'Appleでサインアップ'}
          </button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-black px-4 text-gray-400">または</span>
          </div>
        </div>
        
        {/* Email Login - Placeholder */}
        <button
          disabled
          className="w-full px-6 py-4 bg-white text-black rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200 opacity-50 cursor-not-allowed"
        >
          メールで続行（準備中）
        </button>
        
        <div className="text-center pt-4">
          <p className="text-gray-400 text-sm">
            既にアカウントをお持ちですか？{' '}
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
              ログイン
            </span>
          </p>
        </div>

      </div>

      {/* Footer Links */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-6 text-gray-500 text-sm">
          <a 
            href="/legal/terms" 
            className="hover:text-gray-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            利用規約
          </a>
          <a 
            href="/legal/privacy" 
            className="hover:text-gray-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            プライバシーポリシー
          </a>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-900/20 border border-red-700 text-red-400">
          {decodeURIComponent(error)}
        </div>
      )}

      {message && (
        <div className="p-3 rounded-md text-sm bg-green-900/20 border border-green-700 text-green-400">
          {decodeURIComponent(message)}
        </div>
      )}

    </div>
  )
}