'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useAuth } from '../auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { 
  X, 
  LogOut,
  Zap,
  BarChart3,
  DollarSign,
  Settings
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UsageStats {
  totalChats: number;
  monthlyChats: number;
  totalProposals: number;
  totalProducts: number;
  monthlyCreditsUsed: number;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user, userProfile, credits, subscriptionPlan, signOut } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalChats: 0,
    monthlyChats: 0,
    totalProposals: 0,
    totalProducts: 0,
    monthlyCreditsUsed: 0
  });
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get total chat sessions
      const { count: totalChats } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get monthly chat sessions
      const { count: monthlyChats } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      // Get total proposals
      const { count: totalProposals } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total products
      const { count: totalProducts } = await supabase
        .from('embld_products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get monthly credits used
      const { data: monthlyTransactions } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .lt('amount', 0); // Only negative amounts (usage)

      const monthlyCreditsUsed = monthlyTransactions?.reduce(
        (total, transaction) => total + Math.abs(transaction.amount), 
        0
      ) || 0;

      setUsageStats({
        totalChats: totalChats || 0,
        monthlyChats: monthlyChats || 0,
        totalProposals: totalProposals || 0,
        totalProducts: totalProducts || 0,
        monthlyCreditsUsed
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
    };

    const fetchCreditHistory = async () => {
      if (!user) return;
      
      try {
        const { data: transactions } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setCreditHistory(transactions || []);
      } catch (error) {
        console.error('Failed to fetch credit history:', error);
      }
    };

    if (isOpen && user) {
      fetchUsageStats();
      fetchCreditHistory();
    }
  }, [isOpen, user, supabase]);


  const getTransactionTypeLabel = (transactionType: string): string => {
    switch (transactionType) {
      case 'chat_usage':
        return 'チャット使用';
      case 'proposal_creation':
        return '企画書作成';
      case 'subscription_bonus':
        return 'サブスクリプションボーナス';
      case 'monthly_bonus':
        return '月次ボーナス';
      case 'refund':
        return '返金';
      default:
        return transactionType;
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
            <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
                <h2 className="text-xl font-semibold text-[#e0e0e0]">アカウント</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#a0a0a0]" />
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

                  {/* Usage Statistics Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#e0e0e0]">使用状況</h3>
                    
                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-[#e0e0e0] mb-2">今月の使用量</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0]">チャット回数</span>
                            <span className="text-[#e0e0e0] font-medium">
                              {loading ? '...' : `${usageStats.monthlyChats}回`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0]">使用クレジット</span>
                            <span className="text-[#e0e0e0] font-medium">
                              {loading ? '...' : usageStats.monthlyCreditsUsed}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-[#e0e0e0] mb-2">全期間</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0]">総チャット数</span>
                            <span className="text-[#e0e0e0] font-medium">
                              {loading ? '...' : `${usageStats.totalChats}回`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0]">作成した企画書数</span>
                            <span className="text-[#e0e0e0] font-medium">
                              {loading ? '...' : `${usageStats.totalProposals}個`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#a0a0a0]">作成したプロダクト数</span>
                            <span className="text-[#e0e0e0] font-medium">
                              {loading ? '...' : `${usageStats.totalProducts}個`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-[#e0e0e0] mb-4">クレジット履歴</h4>
                      {loading ? (
                        <p className="text-[#a0a0a0]">Loading...</p>
                      ) : creditHistory.length === 0 ? (
                        <p className="text-[#a0a0a0]">クレジットの使用履歴がありません。</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {creditHistory.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-[#3a3a3a] last:border-0">
                              <div className="flex-1">
                                <p className="text-[#e0e0e0] text-sm font-medium">
                                  {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                                </p>
                                <p className="text-[#a0a0a0] text-xs">
                                  {new Date(transaction.created_at).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className={`text-sm font-medium ${
                                transaction.amount > 0 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dashboard Section */}
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <BarChart3 className="w-6 h-6 text-[#a0a0a0]" />
                          <div>
                            <h4 className="text-lg font-semibold text-[#e0e0e0]">収益ダッシュボード</h4>
                            <p className="text-sm text-[#a0a0a0]">プロダクトの売上と収益分配を管理</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-[#e0e0e0] hover:bg-[#d0d0d0] text-[#1a1a1a]"
                          onClick={() => {
                            onClose();
                            window.location.href = '/dashboard/revenue';
                          }}
                        >
                          ダッシュボードへ
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-[#a0a0a0]" />
                          <span className="text-sm text-[#e0e0e0]">収益分析</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-[#a0a0a0]" />
                          <span className="text-sm text-[#e0e0e0]">Stripe設定</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[#3a3a3a]">
                        <div className="flex gap-2 mb-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-[#4a4a4a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0]"
                            onClick={() => {
                              onClose();
                              window.location.href = '/dashboard/settings/stripe';
                            }}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Stripe設定
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-[#4a4a4a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0]"
                            onClick={() => {
                              onClose();
                              window.location.href = '/dashboard/revenue';
                            }}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            収益分析
                          </Button>
                        </div>
                        <p className="text-xs text-[#808080]">
                          💡 プロダクトが売れると30%の収益を自動で受け取れます。まずはStripe設定で銀行口座を登録しましょう。
                        </p>
                      </div>
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