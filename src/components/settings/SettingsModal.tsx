'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
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
  ChevronDown
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState('settings');
  const [language, setLanguage] = useState('japanese');
  const [theme, setTheme] = useState('system');
  const [limitedContent, setLimitedContent] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const menuItems = [
    { id: 'account', label: 'アカウント', icon: User },
    { id: 'settings', label: '設定', icon: Settings },
    { id: 'usage', label: '使用状況', icon: Activity },
    { id: 'schedule', label: '定期タスク', icon: Calendar },
    { id: 'mail', label: 'Mail Embld', icon: Mail },
    { id: 'data', label: 'データ管理', icon: Database },
    { id: 'cloud', label: 'クラウドブラウザ', icon: Cloud },
    { id: 'apps', label: '接続されたアプリ', icon: Grid3X3 },
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
              <h3 className="text-lg font-semibold text-white mb-4">一般</h3>
              
              {/* Language Setting */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">言語</label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="japanese">日本語</option>
                    <option value="english">English</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Theme Setting */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">外観</label>
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
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`w-12 h-8 rounded border ${
                            option.id === 'light' ? 'bg-gray-200 border-gray-300' :
                            option.id === 'dark' ? 'bg-gray-800 border-gray-700' :
                            'bg-gradient-to-r from-gray-200 via-gray-400 to-gray-800 border-gray-500'
                          }`}>
                            {option.id === 'system' && (
                              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-800 rounded"></div>
                            )}
                          </div>
                          <span className="text-xs text-gray-300">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Personalization */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">パーソナライゼーション</h3>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">限定コンテンツを受け取る</h4>
                    <p className="text-sm text-gray-400">
                      限定オファー、イベント更新情報、優れたケーススタディ、新機能ガイドを入手。
                    </p>
                  </div>
                  <button
                    onClick={() => setLimitedContent(!limitedContent)}
                    className={`ml-4 w-12 h-6 rounded-full transition-colors ${
                      limitedContent ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      limitedContent ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">
                      キューに入っているタスクが処理を開始したらメールで通知してください
                    </h4>
                    <p className="text-sm text-gray-400">
                      有効にすると、タスクがキューを終了して処理を開始した際にメールでお知らせしますので、進捗状況を簡単に確認できます。この設定はいつでも変更可能です。
                    </p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`ml-4 w-12 h-6 rounded-full transition-colors ${
                      emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Cookie Management */}
            <div className="pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">クッキーを管理</span>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  管理
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">アカウント設定</h3>
            <p className="text-gray-400">アカウント設定はこちらで管理できます。</p>
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">使用状況</h3>
            <p className="text-gray-400">使用状況の詳細はこちらで確認できます。</p>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">{menuItems.find(item => item.id === activeSection)?.label}</h3>
            <p className="text-gray-400">この機能は準備中です。</p>
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
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-80 bg-gray-800 border-r border-gray-700">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <span className="text-white font-semibold">embld</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-1">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Help Section */}
                <div className="absolute bottom-4 left-4 right-4">
                  <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white">
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-sm">ヘルプを取得</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">設定</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
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