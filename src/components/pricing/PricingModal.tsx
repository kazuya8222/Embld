'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, CreditCard, Calendar, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  badge?: string;
  features: string[];
  highlights: string[];
  priceId: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      '毎月30クレジットのリフレッシュ'
    ],
    highlights: [],
    priceId: '',
  },
  {
    id: 'basic',
    name: 'Embld Basic',
    price: 2000,
    period: 'month',
    features: [
      '毎月30クレジットのリフレッシュ',
      '200クレジット/月（購入時付与）',
      'チャットモードへの無制限アクセス'
    ],
    highlights: ['200クレジット/月（購入時付与）'],
    priceId: 'price_1S0fMFFaYIdITkPyE5hOS7lh', // Embld Basic plan price ID
  },
  {
    id: 'plus',
    name: 'Embld Plus',
    price: 6000,
    period: 'month',
    popular: true,
    features: [
      '毎月30クレジットのリフレッシュ',
      '600クレジット/月（購入時付与）',
      'チャットモードへの無制限アクセス',
      'ベータ機能の早期アクセス'
    ],
    highlights: ['600クレジット/月（購入時付与）'],
    priceId: 'price_1S0fNIFaYIdITkPyitTY8NhK', // Embld Plus plan price ID
  }
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDescription, setCancelDescription] = useState('');
  const { subscriptionPlan } = useAuth();

  // プラン名のマッピング関数
  const getCurrentPlanId = () => {
    if (subscriptionPlan === '無料プラン') return 'free';
    if (subscriptionPlan === 'ベーシックプラン') return 'basic';
    if (subscriptionPlan === 'プラスプラン') return 'plus';
    return 'free'; // デフォルト
  };

  const isCurrentPlan = (planId: string) => {
    return getCurrentPlanId() === planId;
  };

  // プランの階層を定義
  const getPlanLevel = (planId: string) => {
    if (planId === 'free') return 0;
    if (planId === 'basic') return 1;
    if (planId === 'plus') return 2;
    return 0;
  };

  const isDowngrade = (planId: string) => {
    const currentLevel = getPlanLevel(getCurrentPlanId());
    const targetLevel = getPlanLevel(planId);
    return targetLevel < currentLevel;
  };

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!priceId) return;
    
    setLoading(priceId);
    
    try {

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const { url, error } = await response.json();
      if (error) {
        throw new Error(error);
      }
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      alert('決済セッションの作成に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelReason,
          description: cancelDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Subscription canceled successfully:', result);
      
      setShowCancelModal(false);
      onClose();
      
      // Optionally reload the page or update the UI to reflect the cancellation
      window.location.reload();
    } catch (error) {
      console.error('解約処理に失敗しました:', error);
      // Show error to user
      alert('解約処理に失敗しました。サポートまでお問い合わせください。');
    }
  };

  const getCurrentPlanPrice = (plan: PricingPlan) => {
    if (billingPeriod === 'yearly') {
      return Math.floor(plan.price * 10); // 17% discount shown in image
    }
    return plan.price;
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
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="bg-[#1a1a1a] w-full h-full overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
                <div className="text-center flex-1">
                  <h2 className="text-xl font-semibold text-[#e0e0e0]">
                    プランアップグレードでクレジット追加
                  </h2>
                  
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#a0a0a0]" />
                </button>
              </div>

              {/* Pricing Plans */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {pricingPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`relative rounded-lg border p-6 ${
                        plan.popular
                          ? 'border-[#0066cc] bg-[#2a2a2a]'
                          : 'border-[#3a3a3a] bg-[#2a2a2a]'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-[#0066cc] text-[#e0e0e0] text-xs font-semibold px-3 py-1 rounded-full">
                            人気
                          </span>
                        </div>
                      )}
                      
                      {/* Plan Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-[#e0e0e0]">{plan.name}</h3>
                          {plan.badge && (
                            <span className="bg-[#3a3a3a] text-[#a0a0a0] text-xs px-2 py-1 rounded">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-3xl font-bold text-[#e0e0e0] mb-1">
                          ¥{getCurrentPlanPrice(plan).toLocaleString()}
                          <span className="text-sm font-normal text-[#a0a0a0]">
                            /{billingPeriod === 'monthly' ? '月' : '年'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mb-6">
                        {isCurrentPlan(plan.id) ? (
                          <Button
                            disabled
                            className="w-full bg-[#5a5a5a] text-[#a0a0a0] cursor-not-allowed"
                          >
                            現在のプラン
                          </Button>
                        ) : isDowngrade(plan.id) ? (
                          <Button
                            disabled
                            className="w-full bg-[#3a3a3a] text-[#6a6a6a] cursor-not-allowed border border-[#4a4a4a]"
                          >
                            利用不可
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleUpgrade(plan.priceId, plan.name)}
                            disabled={loading === plan.priceId}
                            className="w-full bg-[#e0e0e0] text-black hover:bg-[#c0c0c0]"
                          >
                            {loading === plan.priceId ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                処理中...
                              </div>
                            ) : (
                              `${plan.name}にアップグレード`
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span 
                              className={`text-sm ${
                                plan.highlights.some(highlight => feature.includes(highlight))
                                  ? 'text-[#e0e0e0] font-medium'
                                  : 'text-[#a0a0a0]'
                              }`}
                            >
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cancel Subscription Section */}
                {getCurrentPlanId() !== 'free' && (
                  <div className="mt-12 pt-8 border-t border-[#3a3a3a] max-w-5xl mx-auto">
                    <div className="text-center">
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="text-xs text-[#8a8a8a] hover:text-[#a0a0a0] underline transition-colors"
                      >
                        サブスクリプションを解約する
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Cancel Subscription Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60]"
              onClick={() => setShowCancelModal(false)}
            />
            
            {/* Cancel Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <div className="bg-[#1a1a1a] max-w-lg w-full rounded-xl p-8">
                <h2 className="text-2xl font-bold text-[#e0e0e0] mb-6">
                  プランを解約
                </h2>
                
                <p className="text-[#a0a0a0] mb-8 leading-relaxed">
                  解約するとEmbld継続課金が停止されます。いつでも再度登録することができます。
                </p>
                
                <div className="mb-6">
                  <label className="block text-[#e0e0e0] font-medium mb-3">
                    解約の主な理由は何ですか？
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-[#e0e0e0] focus:border-[#0066cc] focus:outline-none"
                  >
                    <option value="">選択してください</option>
                    <option value="too-expensive">料金が高すぎる</option>
                    <option value="not-using">あまり使用していない</option>
                    <option value="technical-issues">技術的な問題</option>
                    <option value="switching-service">他のサービスに移行</option>
                    <option value="temporary">一時的に不要</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                
                <div className="mb-8">
                  <label className="block text-[#e0e0e0] font-medium mb-3">
                    この決断に至った理由を簡単にお聞かせください。
                  </label>
                  <textarea
                    value={cancelDescription}
                    onChange={(e) => setCancelDescription(e.target.value.slice(0, 500))}
                    placeholder="例：解約の理由"
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3 text-[#e0e0e0] focus:border-[#0066cc] focus:outline-none resize-none h-24"
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-[#6a6a6a] mt-1">
                    {cancelDescription.length}/500
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 bg-[#3a3a3a] text-[#e0e0e0] hover:bg-[#4a4a4a] border-0"
                  >
                    戻る
                  </Button>
                  <Button
                    onClick={handleCancelSubscription}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    プランを解約
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}