'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Calendar, 
  Trash2,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count?: number;
}

export default function AgentHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    const filtered = sessions.filter(session =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSessions(filtered);
  }, [searchQuery, sessions]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (count)
        `)
        .eq('user_id', user?.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const sessionsWithCount = (data || []).map((session: any) => ({
        ...session,
        message_count: session.chat_messages?.[0]?.count || 0
      }));
      
      setSessions(sessionsWithCount);
      setFilteredSessions(sessionsWithCount);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('このチャットを削除してもよろしいですか？')) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#e0e0e0]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative">
      {/* TopBar */}
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
      
      {/* Sidebar */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 h-full"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2">エージェント履歴</h1>
            <p className="text-[#a0a0a0]">過去のAIエージェントとの対話履歴を管理</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0] w-5 h-5" />
              <input
                type="text"
                placeholder="チャットを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-[#e0e0e0] placeholder-[#a0a0a0] focus:outline-none focus:border-[#0066cc]"
              />
            </div>
          </div>

          {/* Chat List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-[#a0a0a0]">Loading...</div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-[#5a5a5a] mx-auto mb-4" />
              <div className="text-[#a0a0a0]">チャット履歴がありません</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => router.push(`/agents/${session.id}`)}
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg p-6 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-[#e0e0e0]">
                          {session.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#a0a0a0]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(session.updated_at), {
                              addSuffix: true,
                              locale: ja
                            })}
                          </span>
                        </div>
                        {session.message_count !== undefined && (
                          <div>
                            {session.message_count} メッセージ
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        className="p-2 hover:bg-[#3a3a3a] rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4 text-[#a0a0a0]" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-[#a0a0a0]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}