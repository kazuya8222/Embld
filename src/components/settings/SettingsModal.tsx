'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useAuth } from '../auth/AuthProvider';
import { 
  X, 
  User, 
  Settings, 
  Activity, 
  Calendar, 
  Mail, 
  Database, 
  Cloud, 
  Grid3X3,
  HelpCircle,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Zap,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, userProfile, credits, subscriptionPlan, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [language, setLanguage] = useState('japanese');
  const [theme, setTheme] = useState('system');
  const [limitedContent, setLimitedContent] = useState(true);

  const menuItems = [
    { id: 'account', label: 'アカウント', icon: User },
    { id: 'settings', label: '設定', icon: Settings },
    { id: 'usage', label: '使用状況', icon: Activity },
    { id: 'help', label: 'ヘルプを取得', icon: HelpCircle },
  ];

  const themeOptions = [
    { id: 'light', label: 'ライト', icon: Sun },
    { id: 'dark', label: 'ダーク', icon: Moon },
    { id: 'system', label: 'システムに従う', icon: Monitor },
  ];

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'settings':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">一般</h3>
              
              {/* Language Setting */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#a0a0a0] mb-3">言語</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#3a3a3a] border border-[#4a4a4a] rounded-lg px-3 py-2 text-[#e0e0e0] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="japanese">日本語</option>
                    <option value="english">English</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a0a0a0] pointer-events-none" />
                </div>
              </div>

              {/* Theme Setting */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#a0a0a0] mb-3">外観</label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          theme === option.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-[#4a4a4a] bg-[#3a3a3a] hover:border-[#5a5a5a]'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`w-12 h-8 rounded border ${
                            option.id === 'light' ? 'bg-[#e0e0e0] border-[#c0c0c0]' :
                            option.id === 'dark' ? 'bg-[#2a2a2a] border-[#3a3a3a]' :
                            'bg-gradient-to-r from-[#e0e0e0] via-[#a0a0a0] to-[#2a2a2a] border-[#5a5a5a]'
                          }`}>
                            {option.id === 'system' && (
                              <div className="w-full h-full bg-gradient-to-r from-[#e0e0e0] to-[#2a2a2a] rounded"></div>
                            )}
                          </div>
                          <span className="text-xs text-[#a0a0a0]">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Personalization */}
            <div>
              <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">パーソナライゼーション</h3>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-[#e0e0e0] font-medium mb-1">限定コンテンツを受け取る</h4>
                    <p className="text-sm text-[#a0a0a0]">
                      限定オファー、イベント更新情報、優れたケーススタディ、新機能ガイドを入手。
                    </p>
                  </div>
                  <button
                    onClick={() => setLimitedContent(!limitedContent)}
                    className={`ml-4 w-12 h-6 rounded-full transition-colors ${
                      limitedContent ? 'bg-blue-600' : 'bg-[#5a5a5a]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      limitedContent ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Cookie Management */}
            <div className="pt-6 border-t border-[#3a3a3a]">
              <div className="flex items-center justify-between">
                <span className="text-[#e0e0e0] font-medium">クッキーを管理</span>
                <Button variant="outline" size="sm" className="border-[#4a4a4a] text-[#a0a0a0] hover:bg-[#3a3a3a]">
                  管理
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'account':
        return (
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
                <h3 className="text-xl font-semibold text-[#e0e0e0]">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || 'ユーザー'}
                </h3>
                <p className="text-[#a0a0a0]">{user?.email}</p>
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
                className="flex items-center space-x-3 px-3 py-2.5 text-red-400 hover:bg-[#3a3a3a] hover:text-red-300 transition-colors text-sm rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>ログアウト</span>
              </button>
            </div>

            {/* Plan Section */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#e0e0e0]">
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
                    <p className="text-[#e0e0e0] font-medium">クレジット</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#e0e0e0] font-medium">{credits.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">使用状況</h3>
            <p className="text-[#a0a0a0]">使用状況の詳細はこちらで確認できます。</p>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">ヘルプを取得</h3>
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
              <p className="text-[#c0c0c0] mb-4">
                EmBldの使い方やよくある質問については、ヘルプページをご確認ください。
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.open('/help', '_blank');
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span>ヘルプページを開く</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">{menuItems.find(item => item.id === activeSection)?.label}</h3>
            <p className="text-[#a0a0a0]">この機能は準備中です。</p>
          </div>
        );
    }
  };

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
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-80 bg-[#2a2a2a] border-r border-[#3a3a3a]">
                {/* Header */}
                <div className="p-6 border-b border-[#3a3a3a]">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/images/EnBld_logo_icon_monochrome.svg"
                      alt="EMBLD Icon"
                      className="w-8 h-8 brightness-0 invert"
                    />
                    <span className="text-[#e0e0e0] font-semibold">EMBLD</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-1">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const isHelp = item.id === 'help';
                    const showDivider = index > 0 && menuItems[index - 1].id === 'usage';
                    
                    return (
                      <React.Fragment key={item.id}>
                        {showDivider && <div className="border-t border-[#3a3a3a] my-2"></div>}
                        <button
                          onClick={() => {
                            if (isHelp) {
                              onClose();
                              window.open('/help', '_blank');
                            } else {
                              setActiveSection(item.id);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                            activeSection === item.id
                              ? 'bg-[#3a3a3a] text-[#e0e0e0]'
                              : 'text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0]'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          {isHelp && (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
                  <h2 className="text-xl font-semibold text-[#e0e0e0]">設定</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#a0a0a0]" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {renderSettingsContent()}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}