'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Grid3X3,
  FileText,
  LogIn,
  LogOut,
  Shield,
  User,
  PanelLeftClose,
  Rocket,
  Archive,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';
import { AccountModal } from '../account/AccountModal';

interface SidebarProps {
  className?: string;
  onLockToggle?: () => void;
  isLocked?: boolean;
}

const topMenuItems = [
  { icon: Home, label: 'ホーム', href: '/home' },
  { icon: Rocket, label: 'プロダクト', href: '/products' },
  { icon: FileText, label: '企画書', href: '/proposals' },
];

const bottomMenuItems = [
  { icon: Grid3X3, label: 'プロダクト一覧', href: '/embld-products' },
  { icon: FileText, label: '記事', href: '/articles' },
];

export function Sidebar({ className, onLockToggle, isLocked = false }: SidebarProps) {
  const [isCollapsed] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();



  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-[#2a2a2a] text-[#e0e0e0] border-r border-[#3a3a3a]",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Toggle Button */}
      <div className="p-4">
        <Button 
          onClick={onLockToggle}
          variant="ghost"
          size="sm"
          className={isLocked
            ? "transition-all p-2 text-[#e0e0e0] bg-[#3a3a3a]"
            : "transition-all p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
          }
          title={isLocked ? "サイドバーを固定解除" : "サイドバーを固定"}
        >
          <PanelLeftClose className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="px-2 space-y-1">
        {topMenuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href || (item.href === '/home' && pathname === '/')
                ? "bg-[#3a3a3a] text-[#e0e0e0]"
                : "text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
            )}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.label}
          </Link>
        ))}
        
        {/* Chat History Section */}
        {!isCollapsed && user && (
          <Link
            href="/agents/history"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
          >
            <Archive className="w-5 h-5 mr-3" />
            チャット履歴
          </Link>
        )}
        
        {/* Separator */}
        <div className="my-6">
          <div className="border-t border-[#3a3a3a]"></div>
        </div>
        
        {bottomMenuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-[#3a3a3a] text-[#e0e0e0]"
                : "text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
            )}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User Section */}
      <div className="p-4 border-t border-[#3a3a3a]">
        {user ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <>
                <button
                  onClick={() => setIsAccountOpen(true)}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  アカウント
                </button>
                <Link
                  href="/help"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  ヘルプ
                </Link>
                {userProfile?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:text-red-300 hover:bg-[#3a3a3a] transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    管理者画面
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  ログアウト
                </button>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                <button onClick={handleSignOut} className="p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {!isCollapsed && (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-3" />
                  ログイン
                </Link>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                <Link href="/auth/login" className="p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <LogIn className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Account Modal */}
      <AccountModal 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />
    </div>
  );
}