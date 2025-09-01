'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Lightbulb, 
  BarChart3, 
  Home,
  Shield,
  FileText,
  MessageSquare,
  BookOpen,
  Monitor,
  Package,
  DollarSign
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: Home },
  { name: 'ユーザー管理', href: '/admin/users', icon: Users },
  { name: '企画書管理', href: '/admin/proposals', icon: FileText },
  { name: 'ブログ管理', href: '/admin/blogs', icon: BookOpen },
  { name: 'プロダクト管理', href: '/admin/products', icon: Monitor },
  { name: '出金管理', href: '/admin/transfers', icon: DollarSign },
  { name: 'お問い合わせ管理', href: '/admin/contacts', icon: MessageSquare },
  { name: '統計・分析', href: '/admin/analytics', icon: BarChart3 },
  { name: '違反管理', href: '/admin/violations', icon: Shield },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [unreadContacts, setUnreadContacts] = useState<number>(0)
  const [pendingWithdrawals, setPendingWithdrawals] = useState<number>(0)

  useEffect(() => {
    const fetchUnreadContacts = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
      
      setUnreadContacts(count || 0)
    }

    const fetchPendingWithdrawals = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      setPendingWithdrawals(count || 0)
    }

    fetchUnreadContacts()
    fetchPendingWithdrawals()

    // リアルタイム更新を設定
    const supabase = createClient()
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        () => {
          fetchUnreadContacts()
        }
      )
      .subscribe()

    const withdrawalsChannel = supabase
      .channel('withdrawals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests'
        },
        () => {
          fetchPendingWithdrawals()
        }
      )
      .subscribe()

    return () => {
      contactsChannel.unsubscribe()
      withdrawalsChannel.unsubscribe()
    }
  }, [])

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">管理者パネル</h2>
          <p className="text-sm text-gray-600 mt-1">EmBld Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const isContactsPage = item.href === '/admin/contacts'
            const isTransfersPage = item.href === '/admin/transfers'
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
                {isContactsPage && unreadContacts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {unreadContacts > 99 ? '99+' : unreadContacts}
                  </span>
                )}
                {isTransfersPage && pendingWithdrawals > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {pendingWithdrawals > 99 ? '99+' : pendingWithdrawals}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/home"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← ユーザー画面に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}