'use client'

import { loginWithGoogle } from '@/app/auth/actions'
import { cn } from '@/lib/utils/cn'
import { useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const [isPending, startTransition] = useTransition()

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
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
        <h1 className="text-3xl font-bold text-white mb-2">Embldにログインする</h1>
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
              "w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium",
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
            {isPending ? 'ログイン中...' : 'Googleでログイン'}
          </button>
        </form>

      </div>

      {/* Footer Links */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-6 text-gray-500 text-sm">
          <a 
            href="/legal/terms" 
            className="hover:text-gray-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            利用規約
          </a>
          <a 
            href="/legal/privacy" 
            className="hover:text-gray-300 underline"
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