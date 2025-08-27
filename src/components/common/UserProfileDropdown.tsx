'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  User, 
  Home, 
  LogOut,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Bell,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { AccountModal } from '../account/AccountModal';
import { PricingModal } from '../pricing/PricingModal';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const { user, userProfile, credits, signOut, refreshCredits } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAccountClick = () => {
    setIsOpen(false);
    setIsAccountOpen(true);
  };

  if (!user) {
    return null;
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (userProfile?.username) {
      return userProfile.username.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    return userProfile?.username || user?.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    return user.email || '';
  };

  const getAvatarUrl = () => {
    return userProfile?.google_avatar_url || user?.user_metadata?.avatar_url;
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Top Bar Icons */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <button className="p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Credits */}
          <button 
            onClick={refreshCredits}
            className="flex items-center space-x-2 px-3 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors"
            title="クリックでクレジットを更新"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[#e0e0e0] text-sm">{credits.toLocaleString()}</span>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-[#e0e0e0] font-semibold transition-colors overflow-hidden"
          >
            {getAvatarUrl() ? (
              <img 
                src={getAvatarUrl()} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </button>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-72 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* User Info Header */}
              <div className="p-3 border-b border-[#3a3a3a]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-[#e0e0e0] font-semibold text-sm overflow-hidden">
                    {getAvatarUrl() ? (
                      <img 
                        src={getAvatarUrl()} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#e0e0e0] font-semibold text-base truncate">
                      {getUserName()}
                    </h3>
                    <p className="text-[#a0a0a0] text-xs truncate">
                      {getUserEmail()}
                    </p>
                  </div>
                  <button className="p-1.5 text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Plan Section */}
              <div className="p-3 border-b border-[#3a3a3a]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#a0a0a0] font-medium text-sm">無料</span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      setIsPricingOpen(true);
                    }}
                    className="bg-[#e0e0e0] text-black hover:bg-[#c0c0c0] px-3 py-1 text-xs h-7"
                  >
                    アップグレード
                  </Button>
                </div>
                
                {/* Credits */}
                <div className="flex items-center justify-between p-2.5 bg-[#3a3a3a]/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-[#a0a0a0] text-sm">クレジット</span>
                    <button className="p-1 text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors">
                      <HelpCircle className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#e0e0e0] font-semibold text-sm">{credits.toLocaleString()}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#a0a0a0]" />
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {/* Account */}
                <button 
                  onClick={handleAccountClick}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0] transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>アカウント</span>
                </button>

                <div className="border-t border-[#3a3a3a] my-1"></div>

                {/* Homepage */}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0] transition-colors text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <Home className="w-4 h-4" />
                    <span>ホームページ</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="border-t border-[#3a3a3a] my-1"></div>

                {/* Sign Out */}
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-[#3a3a3a] hover:text-red-300 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Modal */}
      <AccountModal 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />
      
      {/* Pricing Modal */}
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
      />
    </>
  );
}