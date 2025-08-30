'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, Save, X, Send } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';

interface Proposal {
  id: string;
  service_name: string;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  main_features: Array<{
    name: string;
    description: string;
  }>;
  business_model: string;
  recruitment_message: string;
  status: '未提出' | '審査中' | '承認済み' | '却下';
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ProposalPageProps {
  params: { id: string };
}

export default function ProposalPage({ params }: ProposalPageProps) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProposal, setEditedProposal] = useState<Proposal | null>(null);
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleMenuToggle = () => {
    setIsSidebarLocked(!isSidebarLocked);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuHover = (isHovering: boolean) => {
    setIsSidebarHovered(isHovering);
    if (!isSidebarLocked) {
      setIsSidebarOpen(isHovering);
    }
  };

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered;

  useEffect(() => {
    async function fetchProposal() {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Error fetching proposal:', error);
          setError('企画書が見つかりませんでした');
          return;
        }

        setProposal(data);
        setEditedProposal(data);
      } catch (err) {
        console.error('Error:', err);
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    fetchProposal();
  }, [params.id, supabase]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProposal(proposal);
  };

  const handleSave = async () => {
    if (!editedProposal) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          service_name: editedProposal.service_name,
          problem_statement: editedProposal.problem_statement,
          solution_description: editedProposal.solution_description,
          target_users: editedProposal.target_users,
          main_features: editedProposal.main_features,
          business_model: editedProposal.business_model,
          recruitment_message: editedProposal.recruitment_message,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) {
        console.error('Error updating proposal:', error);
        return;
      }

      setProposal(editedProposal);
      setIsEditing(false);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Proposal, value: string) => {
    if (!editedProposal) return;
    setEditedProposal({
      ...editedProposal,
      [field]: value,
    });
  };

  const handleRequestDevelopment = async () => {
    if (!user || !proposal) return;
    
    const currentCredits = userProfile?.credits_balance || 0;
    if (currentCredits < 100) {
      return;
    }


    setIsSubmitting(true);
    try {
      const response = await fetch('/api/proposals/request-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: proposal.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '開発依頼に失敗しました');
      }

      // Update local state
      setProposal(prev => prev ? { ...prev, status: '審査中' } : null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Development request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#e0e0e0]">Loading...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || '企画書が見つかりませんでした'}</div>
          <Button onClick={() => router.push('/proposals')} className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">企画書一覧に戻る</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!proposal) return null;
    switch (proposal.status) {
      case '審査中':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
            審査中
          </span>
        );
      case '承認済み':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
            承認済み
          </span>
        );
      case '却下':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
            却下
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#5a5a5a]/20 text-[#808080] text-sm">
            未提出
          </span>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] relative overflow-hidden">
      {/* Sidebar Overlay */}
      {shouldShowSidebar && (
        <div
          className="fixed left-0 top-0 z-50"
          onMouseEnter={() => handleMenuHover(true)}
          onMouseLeave={() => handleMenuHover(false)}
        >
          <Sidebar onLockToggle={handleMenuToggle} />
        </div>
      )}

      {/* TopBar */}
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-24">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/proposals')}
                variant="ghost"
                size="sm"
                className="text-[#808080] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProposal?.service_name || ''}
                    onChange={(e) => handleFieldChange('service_name', e.target.value)}
                    className="text-2xl font-bold text-[#e0e0e0] bg-[#2a2a2a] border border-[#3a3a3a] rounded px-3 py-2 mb-2"
                    placeholder="サービス名を入力"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-[#e0e0e0]">
                    🚀 {proposal.service_name || '企画書'}
                  </h1>
                )}
                <div className="flex items-center gap-4">
                  <p className="text-sm text-[#808080]">
                    作成日: {new Date(proposal.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  {getStatusBadge()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    variant="outline"
                    size="sm"
                    className="text-green-400 border-green-600 hover:bg-green-900/20"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-600 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    キャンセル
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="text-white border-[#0066cc] bg-[#0066cc] hover:bg-[#0052a3]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Problem Statement */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
              <h2 className="text-lg font-semibold text-[#ff9500] mb-3">
                😵 解決したい課題
              </h2>
              {isEditing ? (
                <Textarea
                  value={editedProposal?.problem_statement || ''}
                  onChange={(e) => handleFieldChange('problem_statement', e.target.value)}
                  className="w-full min-h-[120px] bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] focus:border-[#ff9500]"
                  placeholder="解決したい課題を入力してください"
                />
              ) : (
                <div className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">
                  {proposal.problem_statement || '内容が生成されていません'}
                </div>
              )}
            </div>

            {/* Solution */}
            <div className="bg-gradient-to-br from-[#0066cc]/20 to-purple-900/20 rounded-lg p-6 border border-[#0066cc]/30">
              <h2 className="text-lg font-semibold text-[#4da6ff] mb-3">
                ✨ 僕たちの解決策
              </h2>
              {isEditing ? (
                <Textarea
                  value={editedProposal?.solution_description || ''}
                  onChange={(e) => handleFieldChange('solution_description', e.target.value)}
                  className="w-full min-h-[120px] bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] focus:border-[#ff9500]"
                  placeholder="解決策を入力してください"
                />
              ) : (
                <div className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">
                  {proposal.solution_description || '内容が生成されていません'}
                </div>
              )}
            </div>

            {/* Target Users */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
              <h2 className="text-lg font-semibold text-[#52c41a] mb-3">
                🎯 ターゲットユーザー
              </h2>
              {isEditing ? (
                <Textarea
                  value={editedProposal?.target_users || ''}
                  onChange={(e) => handleFieldChange('target_users', e.target.value)}
                  className="w-full min-h-[120px] bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] focus:border-[#ff9500]"
                  placeholder="ターゲットユーザーを入力してください"
                />
              ) : (
                <div className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">
                  {proposal.target_users || '内容が生成されていません'}
                </div>
              )}
            </div>

            {/* Main Features */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
              <h2 className="text-lg font-semibold text-[#ff9500] mb-3">
                🛠️ 主要機能
              </h2>
              <div className="space-y-3">
                {proposal.main_features && proposal.main_features.length > 0 ? (
                  proposal.main_features.map((feature, index) => (
                    <div key={index} className="bg-[#1a1a1a]/50 rounded-lg p-3 border border-[#3a3a3a]">
                      <h3 className="font-semibold text-[#4da6ff] mb-1">
                        {feature.name}
                      </h3>
                      <p className="text-[#a0a0a0] text-sm">
                        {feature.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-[#5a5a5a]">
                    機能が登録されていません
                  </div>
                )}
              </div>
            </div>

            {/* Business Model */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
              <h2 className="text-lg font-semibold text-[#faad14] mb-3">
                💰 ビジネスモデル
              </h2>
              {isEditing ? (
                <Textarea
                  value={editedProposal?.business_model || ''}
                  onChange={(e) => handleFieldChange('business_model', e.target.value)}
                  className="w-full min-h-[120px] bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] focus:border-[#ff9500]"
                  placeholder="ビジネスモデルを入力してください"
                />
              ) : (
                <div className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">
                  {proposal.business_model || '内容が生成されていません'}
                </div>
              )}
            </div>

            {/* Recruitment Message */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30 mb-20">
              <h2 className="text-lg font-semibold text-[#b37feb] mb-3">
                🤝 一緒に作りませんか？
              </h2>
              {isEditing ? (
                <Textarea
                  value={editedProposal?.recruitment_message || ''}
                  onChange={(e) => handleFieldChange('recruitment_message', e.target.value)}
                  className="w-full min-h-[120px] bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] focus:border-[#ff9500]"
                  placeholder="募集メッセージを入力してください"
                />
              ) : (
                <div className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">
                  {proposal.recruitment_message || '内容が生成されていません'}
                </div>
              )}
            </div>

            {/* Reviewer Notes (if any) */}
            {proposal.reviewer_notes && (
              <div className="bg-[#faad14]/10 rounded-lg p-6 border border-[#faad14]/30">
                <h2 className="text-lg font-semibold text-[#faad14] mb-3">
                  📝 レビュアーからのフィードバック
                </h2>
                <div className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">
                  {proposal.reviewer_notes}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md mx-4 border border-[#3a3a3a]">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#e0e0e0] mb-2">
                開発依頼を送信しました
              </h3>
              <p className="text-[#a0a0a0] mb-6">
                審査結果をお待ちください。
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-[#0066cc] text-white hover:bg-[#0052a3]"
              >
                確認
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Development Request Button */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#3a3a3a] p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {proposal.status === '未提出' ? (
              <>
                <div className="text-[#a0a0a0] text-sm">
                  開発依頼には100クレジットが必要です (現在: {userProfile?.credits_balance || 0}クレジット)
                </div>
                <Button
                  onClick={handleRequestDevelopment}
                  disabled={isSubmitting || !user || (userProfile?.credits_balance || 0) < 100}
                  className="bg-[#0066cc] text-white hover:bg-[#0052a3] disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? '送信中...' : '開発を依頼'}
                </Button>
              </>
            ) : (
              <>
                <div className="text-[#a0a0a0] text-sm">
                  開発依頼済みです
                </div>
                <Button
                  disabled={true}
                  className="bg-[#5a5a5a] text-[#a0a0a0] cursor-not-allowed opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  開発依頼済み
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}