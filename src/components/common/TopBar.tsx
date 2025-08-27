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
import { UserProfileDropdown } from './UserProfileDropdown';

interface TopBarProps {
  onMenuToggle?: () => void;
  onMenuHover?: (isHovering: boolean) => void;
  isMenuLocked?: boolean;
}

export function TopBar({ onMenuToggle, onMenuHover, isMenuLocked = false }: TopBarProps) {
  const { user, userProfile } = useAuth();

  return (
    <div className="h-14 bg-[#1a1a1a] flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {onMenuToggle && onMenuHover && (
          <button
            onClick={onMenuToggle}
            onMouseEnter={() => onMenuHover(true)}
            onMouseLeave={() => onMenuHover(false)}
            className={isMenuLocked 
              ? "p-2 rounded-lg transition-colors text-[#e0e0e0] bg-[#3a3a3a]"
              : "p-2 rounded-lg transition-colors text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
            }
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        
        <Link href="/home" className="flex items-center gap-2">
          <img 
            src="/images/EnBld_logo_icon_monochrome.svg"
            alt="EMBLD Icon"
            className="w-6 h-6 brightness-0 invert"
          />
          <span className="text-lg font-bold text-[#e0e0e0]">EMBLD</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <UserProfileDropdown />
      </div>
    </div>
  );
}