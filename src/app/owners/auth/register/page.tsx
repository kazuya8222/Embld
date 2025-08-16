'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ownersLoginWithGoogle } from '../actions';

export default function OwnersRegisterPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await ownersLoginWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <Link href="/owners" className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/images/EnBld_logo_icon_monochrome.svg"
              alt="EMBLD Icon"
              className="h-12 w-12"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 leading-none">EMBLD</span>
              <span className="text-sm text-purple-600 leading-none">for owners</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            新規登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            個人開発プロダクトを共有しよう
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Googleログインのみ */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'ログイン中...' : 'Googleで登録'}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/owners/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
              ログイン
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            登録することで、
            <Link href="/legal/terms" className="text-purple-600 hover:text-purple-500">
              利用規約
            </Link>
            および
            <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-500">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}