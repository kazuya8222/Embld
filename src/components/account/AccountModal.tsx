'use client'

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useAuth } from '../auth/AuthProvider';
import { 
  X, 
  LogOut,
  Zap
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user, userProfile, credits, subscriptionPlan, signOut } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a] dark:border-[#3a3a3a] border-gray-200">
                <h2 className="text-xl font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900">アカウント</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#3a3a3a] dark:hover:bg-[#3a3a3a] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-8">
                  {/* User Profile Section */}
                  <div className="flex items-center space-x-4">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
                           user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900">
                        {user?.user_metadata?.full_name || user?.user_metadata?.name || 'ユーザー'}
                      </h3>
                      <p className="text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600">{user?.email}</p>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await signOut();
                          onClose();
                        } catch (error) {
                          console.error('Logout error:', error);
                        }
                      }}
                      className="flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-[#3a3a3a] dark:hover:bg-[#3a3a3a] hover:bg-red-50 hover:text-red-300 dark:hover:text-red-300 hover:text-red-500 transition-colors text-sm rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ログアウト</span>
                    </button>
                  </div>

                  {/* Plan Section */}
                  <div className="bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-50 border border-[#3a3a3a] dark:border-[#3a3a3a] border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900">
                        {subscriptionPlan}
                      </h4>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        プランを管理
                      </Button>
                    </div>

                    {/* Credits Section */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 font-medium">クレジット</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 font-medium">{credits.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Usage Statistics Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900">使用状況</h3>
                    
                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-50 border border-[#3a3a3a] dark:border-[#3a3a3a] border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 mb-2">今月の使用量</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600">チャット回数</span>
                            <span className="text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 font-medium">0回</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600">使用クレジット</span>
                            <span className="text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 font-medium">0</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-50 border border-[#3a3a3a] dark:border-[#3a3a3a] border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 mb-2">全期間</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600">総チャット数</span>
                            <span className="text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 font-medium">0回</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600">作成したアイデア数</span>
                            <span className="text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 font-medium">0個</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-50 border border-[#3a3a3a] dark:border-[#3a3a3a] border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-[#e0e0e0] dark:text-[#e0e0e0] text-gray-900 mb-4">クレジット履歴</h4>
                      <p className="text-[#a0a0a0] dark:text-[#a0a0a0] text-gray-600">クレジットの使用履歴がここに表示されます。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}