'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  PanelLeft,
  Bell,
  User,
  LogIn,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';

interface TopBarProps {
  onMenuToggle: () => void;
  onMenuHover: (isHovering: boolean) => void;
}

export function TopBar({ onMenuToggle, onMenuHover }: TopBarProps) {
  const { user, userProfile } = useAuth();

  return (
    <div className="h-14 bg-gray-900 flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          onMouseEnter={() => onMenuHover(true)}
          onMouseLeave={() => onMenuHover(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        
        <Link href="/home" className="flex items-center gap-2">
          <img 
            src="/images/EnBld_logo_icon_monochrome.svg"
            alt="EMBLD Icon"
            className="w-6 h-6 brightness-0 invert"
          />
          <span className="text-lg font-bold text-white">EMBLD</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Bell className="w-5 h-5" />
        </Button>
        
        
        <div className="flex items-center gap-2 text-gray-400">
          <Zap className="w-4 h-4" />
          <span className="text-sm">753</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-blue-300 hover:bg-gray-800"
        >
          アップグレード
        </Button>

        {user ? (
          (userProfile?.google_avatar_url || user?.user_metadata?.avatar_url) ? (
            <Link href="/profile">
              <img 
                src={userProfile?.google_avatar_url || user.user_metadata.avatar_url} 
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </Link>
          ) : (
            <Link href="/profile" className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          )
        ) : (
          <Link href="/auth/login" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
            <LogIn className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}