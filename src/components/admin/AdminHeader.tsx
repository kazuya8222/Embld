'use client'

import { signout } from '@/app/auth/actions'
import { LogOut, Bell } from 'lucide-react'

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">EmBld 管理者画面</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-px bg-gray-300" />
        
        <form action={signout}>
          <button 
            type="submit"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </button>
        </form>
      </div>
    </header>
  )
}