'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Settings, 
  Home, 
  LogOut,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Bell,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { SettingsModal } from '../settings/SettingsModal';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();
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

  const handleSettingsClick = () => {
    setIsOpen(false);
    setIsSettingsOpen(true);
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
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Credits */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm">753</span>
          </div>

          {/* User Avatar */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-white font-semibold transition-colors overflow-hidden"
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
              className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* User Info Header */}
              <div className="p-3 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
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
                    <h3 className="text-white font-semibold text-base truncate">
                      {getUserName()}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">
                      {getUserEmail()}
                    </p>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Plan Section */}
              <div className="p-3 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 font-medium text-sm">無料</span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white text-black hover:bg-gray-200 px-3 py-1 text-xs h-7"
                  >
                    アップグレード
                  </Button>
                </div>
                
                {/* Credits */}
                <div className="flex items-center justify-between p-2.5 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">クレジット</span>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      <HelpCircle className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-sm">753</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {/* Settings */}
                <button 
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span>設定</span>
                </button>

                <div className="border-t border-gray-700 my-1"></div>

                {/* Homepage */}
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <Home className="w-4 h-4" />
                    <span>ホームページ</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="border-t border-gray-700 my-1"></div>

                {/* Sign Out */}
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}