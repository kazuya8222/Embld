'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

interface Proposal {
  id: string;
  service_name: string;
  problem_statement: string;
  solution_description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at: string | null;
  created_at: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
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
    async function fetchProposals() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('proposals')
          .select('id, service_name, problem_statement, solution_description, status, submitted_at, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching proposals:', error);
          return;
        }

        setProposals(data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#1a1a1a]">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#e0e0e0]">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] relative overflow-hidden">
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
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2">企画書一覧</h1>
            <p className="text-[#a0a0a0]">作成した企画書を管理できます</p>
          </div>

          {/* Proposals Grid */}
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-[#5a5a5a] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#a0a0a0] mb-2">
                企画書がありません
              </h3>
              <p className="text-[#808080] mb-6">
                最初の企画書を作成してみましょう
              </p>
              <Button
                onClick={() => router.push('/home')}
                className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]"
              >
                <Plus className="w-4 h-4 mr-2" />
                企画書を作成する
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#4a4a4a] transition-colors cursor-pointer group">
                    <Link href={`/proposals/${proposal.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <FileText className="w-6 h-6 text-blue-400 flex-shrink-0" />
                          <ChevronRight className="w-4 h-4 text-[#808080] group-hover:text-[#e0e0e0] transition-colors" />
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <CardTitle className="text-lg text-[#e0e0e0] mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {proposal.service_name || '無題の企画書'}
                        </CardTitle>
                        
                        <p className="text-[#a0a0a0] text-sm mb-4 line-clamp-3">
                          {proposal.problem_statement ? 
                            proposal.problem_statement.slice(0, 100) + (proposal.problem_statement.length > 100 ? '...' : '')
                            : '課題が設定されていません'
                          }
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-[#808080]">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(proposal.created_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {proposal.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              proposal.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                              proposal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {proposal.status === 'submitted' ? '審査中' :
                               proposal.status === 'approved' ? '承認済み' :
                               proposal.status === 'rejected' ? '却下' : '下書き'}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}