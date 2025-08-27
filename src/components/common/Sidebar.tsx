'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { 
  Home, 
  Grid3X3,
  FileText,
  LogIn,
  LogOut,
  Shield,
  Settings,
  PanelLeftClose,
  Rocket,
  MessageSquare,
  Plus,
  Archive,
  Trash2,
  Edit2,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';
import { SettingsModal } from '../settings/SettingsModal';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  className?: string;
  onLockToggle?: () => void;
  isLocked?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

const topMenuItems = [
  { icon: Home, label: 'ホーム', href: '/home' },
  { icon: Rocket, label: 'プロダクト', href: '/products' },
  { icon: FileText, label: '企画書', href: '/proposals' },
];

const bottomMenuItems = [
  { icon: Grid3X3, label: 'プロダクト一覧', href: '/embld-products' },
  { icon: FileText, label: '記事', href: '/articles' },
];

export function Sidebar({ className, onLockToggle, isLocked = false }: SidebarProps) {
  const [isCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.chatId as string;
  const supabase = createClient();

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_archived', false)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setChatSessions(data || []);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      }
    };
    
    if (user) {
      fetchChatSessions();
    }
  }, [user, supabase]);


  const createNewChat = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user.id,
            title: '新しいチャット'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        router.push(`/agents/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const updateChatTitle = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
      
      setChatSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      ));
      setEditingChatId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    if (!confirm('このチャットを削除してもよろしいですか？')) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentChatId === sessionId) {
        router.push('/home');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-[#2a2a2a] text-[#e0e0e0] border-r border-[#3a3a3a]",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Toggle Button */}
      <div className="p-4">
        <Button 
          onClick={onLockToggle}
          variant="ghost"
          size="sm"
          className={isLocked
            ? "transition-all p-2 text-[#e0e0e0] bg-[#3a3a3a]"
            : "transition-all p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
          }
          title={isLocked ? "サイドバーを固定解除" : "サイドバーを固定"}
        >
          <PanelLeftClose className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="px-2 space-y-1">
        {topMenuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href || (item.href === '/home' && pathname === '/')
                ? "bg-[#3a3a3a] text-[#e0e0e0]"
                : "text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
            )}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.label}
          </Link>
        ))}
        
        {/* Chat History Section */}
        {!isCollapsed && user && (
          <>
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                  チャット履歴
                </h3>
                <button
                  onClick={createNewChat}
                  className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
                  title="新しいチャット"
                >
                  <Plus className="w-4 h-4 text-[#a0a0a0] hover:text-[#e0e0e0]" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                    currentChatId === session.id
                      ? "bg-[#3a3a3a] text-[#e0e0e0]"
                      : "text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
                  )}
                  onClick={() => {
                    if (editingChatId !== session.id) {
                      router.push(`/agents/${session.id}`);
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-3 flex-shrink-0" />
                  
                  {editingChatId === session.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateChatTitle(session.id, editTitle);
                        } else if (e.key === 'Escape') {
                          setEditingChatId(null);
                          setEditTitle('');
                        }
                      }}
                      onBlur={() => updateChatTitle(session.id, editTitle)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-[#3a3a3a] border border-[#4a4a4a] rounded px-2 py-1 text-xs text-[#e0e0e0] focus:outline-none focus:border-blue-600"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">
                        {session.title}
                      </div>
                    </div>
                  )}

                  {/* Chat Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChatId(session.id);
                        setEditTitle(session.title);
                      }}
                      className="p-1 hover:bg-[#4a4a4a] rounded"
                    >
                      <Edit2 className="w-3 h-3 text-[#a0a0a0]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                      className="p-1 hover:bg-[#4a4a4a] rounded"
                    >
                      <Trash2 className="w-3 h-3 text-[#a0a0a0]" />
                    </button>
                  </div>
                </div>
              ))}
              
              {chatSessions.length === 0 && (
                <div className="px-3 py-2 text-xs text-[#a0a0a0]">
                  チャット履歴はありません
                </div>
              )}
              
              {chatSessions.length > 0 && (
                <Link
                  href="/agents/history"
                  className="flex items-center px-3 py-2 text-xs text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  <Archive className="w-3 h-3 mr-2" />
                  すべて表示
                </Link>
              )}
            </div>
          </>
        )}
        
        {/* Separator */}
        <div className="my-6">
          <div className="border-t border-[#3a3a3a]"></div>
        </div>
        
        {bottomMenuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-[#3a3a3a] text-[#e0e0e0]"
                : "text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a]"
            )}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User Section */}
      <div className="p-4 border-t border-[#3a3a3a]">
        {user ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  設定
                </button>
                <Link
                  href="/help"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  ヘルプ
                </Link>
                {userProfile?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:text-red-300 hover:bg-[#3a3a3a] transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    管理者画面
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  ログアウト
                </button>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                <button onClick={handleSignOut} className="p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {!isCollapsed && (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-[#a0a0a0] rounded-lg hover:text-[#e0e0e0] hover:bg-[#3a3a3a] transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-3" />
                  ログイン
                </Link>
              </>
            )}
            {isCollapsed && (
              <div className="flex flex-col space-y-2">
                <Link href="/auth/login" className="p-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <LogIn className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}