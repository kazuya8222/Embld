'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Proposal {
  id: string;
  service_overview: string;
  problem: string;
  ideal: string;
  solution: string;
  features: string;
  service_name: string;
  created_at: string;
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
  
  const router = useRouter();
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
      } catch (err) {
        console.error('Error:', err);
        setError('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    fetchProposal();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || '企画書が見つかりませんでした'}</div>
          <Button onClick={() => router.push('/home')}>ホームに戻る</Button>
        </div>
      </div>
    );
  }

  const sections = [
    { title: 'サービス概要', content: proposal.service_overview },
    { title: '課題', content: proposal.problem },
    { title: '理想', content: proposal.ideal },
    { title: '解決策', content: proposal.solution },
    { title: '機能詳細', content: proposal.features },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900 relative overflow-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TopBar */}
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/home')}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {proposal.service_name || '企画書'}
                </h1>
                <p className="text-sm text-gray-400">
                  作成日: {new Date(proposal.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <Share className="w-4 h-4 mr-2" />
                共有
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h2 className="text-lg font-semibold text-orange-400 mb-3">
                  {section.title}
                </h2>
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {section.content || '内容が生成されていません'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}