'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, CreditCard, Calendar, Zap } from 'lucide-react';
import { Button } from '../ui/button';

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
    badge: 'ベータ',
    features: [
      '毎日 300 クレジットのリフレッシュ',
      'チャットモードへのアクセス',
      '1個の同時実行タスク',
      '1件のスケジュールタスク'
    ],
    highlights: [],
    priceId: '',
  },
  {
    id: 'basic',
    name: 'Embld Basic',
    price: 2000,
    period: 'month',
    badge: 'ベータ',
    features: [
      '毎日 300 クレジットのリフレッシュ',
      '2,500クレジット/月',
      '毎月追加 C+2,500クレジットを獲得',
      'チャットモードへの無制限アクセス',
      'Agentモードで高度なモデルを使用',
      '3個の同時実行タスク',
      '3件のスケジュールタスク',
      '画像生成',
      '動画生成',
      'スライド生成'
    ],
    highlights: ['毎月追加 C+2,500クレジットを獲得'],
    priceId: 'price_1S0fMFFaYIdITkPyE5hOS7lh', // Embld Basic plan price ID
  },
  {
    id: 'plus',
    name: 'Embld Plus',
    price: 6000,
    period: 'month',
    badge: 'ベータ',
    popular: true,
    features: [
      '毎日 300 クレジットのリフレッシュ',
      '8,000クレジット/月',
      '毎月追加 C+8,000クレジットを獲得',
      'チャットモードへの無制限アクセス',
      'Agentモードで高度なモデルを使用',
      '5個の同時実行タスク',
      '5件のスケジュールタスク',
      '画像生成',
      '動画生成',
      'スライド生成',
      '独占データソース',
      'ベータ機能の早期アクセス'
    ],
    highlights: ['毎月追加 C+8,000クレジットを獲得', '独占データソース'],
    priceId: 'price_1S0fNIFaYIdITkPyitTY8NhK', // Embld Plus plan price ID
  }
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

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
                  
                  {/* Billing Period Toggle */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => setBillingPeriod('monthly')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        billingPeriod === 'monthly'
                          ? 'bg-[#3a3a3a] text-[#e0e0e0]'
                          : 'text-[#a0a0a0] hover:text-[#e0e0e0]'
                      }`}
                    >
                      毎月
                    </button>
                    <button
                      onClick={() => setBillingPeriod('yearly')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                        billingPeriod === 'yearly'
                          ? 'bg-[#0066cc] text-[#e0e0e0]'
                          : 'bg-[#3a3a3a] text-[#a0a0a0] hover:text-[#e0e0e0]'
                      }`}
                    >
                      年間
                      <span className="absolute -top-1 -right-1 bg-[#0066cc] text-white text-xs px-1.5 py-0.5 rounded">
                        17% 節約
                      </span>
                    </button>
                  </div>
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
                        {plan.id === 'free' ? (
                          <Button
                            disabled
                            className="w-full bg-[#5a5a5a] text-[#a0a0a0] cursor-not-allowed"
                          >
                            現在のプラン
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}