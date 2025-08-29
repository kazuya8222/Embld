'use client'

import { loginWithGoogle, loginWithApple, loginWithGitHub } from '@/app/auth/actions'
import { cn } from '@/lib/utils/cn'
import { useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const [isPending, startTransition] = useTransition()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const canLogin = termsAccepted && privacyAccepted

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
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <img 
            src="/images/EnBld_logo_icon_monochrome.svg"
            alt="EMBLD Icon"
            className="w-12 h-12 brightness-0 invert"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">EMBLDにログイン</h1>
        <p className="text-gray-400 text-sm">アイデアを共有し、今すぐ作成を始めましょう</p>
      </div>

      {/* Terms and Privacy Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-gray-400 text-sm">
            <a 
              href="/legal/terms" 
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              利用規約
            </a>
            に同意する
          </span>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-gray-400 text-sm">
            <a 
              href="/legal/privacy" 
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
            </a>
            に同意する
          </span>
        </label>
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
            disabled={isPending || !canLogin}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl transition-all duration-200 text-white font-medium border border-[#3a3a3a] hover:border-[#4a4a4a]",
              (isPending || !canLogin) && "opacity-50 cursor-not-allowed"
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
            {isPending ? 'ログイン中...' : 'Googleでログイン'}
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
            disabled={isPending || !canLogin}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl transition-all duration-200 text-white font-medium border border-[#3a3a3a] hover:border-[#4a4a4a]",
              (isPending || !canLogin) && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            {isPending ? 'ログイン中...' : 'Appleでログイン'}
          </button>
        </form>
        
        {/* GitHub Login */}
        <form 
          action={(formData) => {
            startTransition(() => {
              loginWithGitHub()
            })
          }}
        >
          <button
            type="submit"
            disabled={isPending || !canLogin}
            className={cn(
              "w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl transition-all duration-200 text-white font-medium border border-[#3a3a3a] hover:border-[#4a4a4a]",
              (isPending || !canLogin) && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {isPending ? 'ログイン中...' : 'GitHubでログイン'}
          </button>
        </form>

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