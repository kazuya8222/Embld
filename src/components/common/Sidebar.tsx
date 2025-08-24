'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Grid3X3,
  FileText,
  User,
  LogIn,
  LogOut,
  Shield,
  Settings,
  PanelLeftClose
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  className?: string;
  onLockToggle?: () => void;
}

const mainMenuItems = [
  { icon: Home, label: 'ホーム', href: '/home' },
  { icon: Grid3X3, label: 'プロダクト一覧', href: '/owners' },
  { icon: FileText, label: '記事一覧', href: '/articles' },
  { icon: FileText, label: '企画書一覧', href: '/proposals' },
];

export function Sidebar({ className, onLockToggle }: SidebarProps) {
  const [isCollapsed] = useState(false);
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
      "flex flex-col h-screen bg-gray-950 text-white border-r border-gray-800",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Toggle Button */}
      <div className="p-4">
        <Button 
          onClick={onLockToggle}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors p-2"
        >
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="px-2 space-y-1">
        {mainMenuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href || (item.href === '/home' && pathname === '/')
                ? "bg-gray-800 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
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
      <div className="p-4 border-t border-gray-800">
        {user ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <>
                <Link
                  href="/profile"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4 mr-3" />
                  マイページ
                </Link>
                <Link
                  href="/profile/settings"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  設定
                </Link>
                {userProfile?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:text-red-300 hover:bg-gray-800 transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    管理者画面
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  ログアウト
                </button>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                <Link href="/profile" className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                </Link>
                <button onClick={handleSignOut} className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
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
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-3" />
                  ログイン
                </Link>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                <Link href="/auth/login" className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <LogIn className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}