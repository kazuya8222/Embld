'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Send,
  Sparkles,
  Code,
  FileText,
  Loader2,
  ChevronRight,
  User,
  Bot,
  Settings,
  Copy,
  Check,
  Menu,
  Share,
  Star,
  HelpCircle,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { Sidebar } from '../common/Sidebar';
import { cn } from '@/lib/utils/cn';
import { useSearchParams } from 'next/navigation';
import { RequirementEditor } from './RequirementEditor';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  agent_type?: string;
  step_info?: any;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  chatId: string;
}

type ViewMode = 'preview' | 'code';
type AgentType = 'service_builder' | 'code_assistant' | 'business_advisor';

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('service_builder');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [showRequirementEditor, setShowRequirementEditor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const agentOptions = [
    { value: 'service_builder', label: 'サービス構築', icon: Sparkles, color: 'text-blue-500' },
    { value: 'code_assistant', label: 'コード生成', icon: Code, color: 'text-green-500' },
    { value: 'business_advisor', label: 'ビジネス', icon: FileText, color: 'text-purple-500' }
  ];

  useEffect(() => {
    fetchSession();
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Handle initial message from query parameter
    const initialMessage = searchParams.get('initial');
    if (initialMessage && !initialMessageSent && messages.length === 0) {
      setInput(initialMessage);
      setInitialMessageSent(true);
      // Auto-send the initial message after a short delay
      setTimeout(() => {
        sendMessage(initialMessage);
      }, 500);
    }
  }, [searchParams, initialMessageSent, messages]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      // Save user message
      const { data: userMsg, error: userError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatId,
            role: 'user',
            content: messageToSend,
            agent_type: selectedAgent
          }
        ])
        .select()
        .single();

      if (userError) throw userError;
      setMessages(prev => [...prev, userMsg]);

      // Update session title if it's the first message
      if (messages.length === 0) {
        const title = messageToSend.length > 50 
          ? messageToSend.substring(0, 50) + '...' 
          : messageToSend;
        
        await supabase
          .from('chat_sessions')
          .update({ 
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);
      }

      // Call AI API based on selected agent
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: chatId,
          agentType: selectedAgent,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      // Save assistant message
      const { data: assistantMsg, error: assistantError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatId,
            role: 'assistant',
            content: data.content,
            agent_type: selectedAgent,
            metadata: data.metadata
          }
        ])
        .select()
        .single();

      if (assistantError) throw assistantError;
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered;

  return (
    <div className="min-h-screen bg-gray-900 relative flex flex-col">
      {/* Top Menu Bar */}
      <div className="px-6 py-3 flex items-center justify-between bg-gray-950">
        {/* Left side - Menu and Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleMenuToggle}
            onMouseEnter={() => handleMenuHover(true)}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
          >
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Center - Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-base font-medium text-white">
            {session?.title || 'AIエージェントの未来'}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button 
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="共有"
          >
            <Share className="w-4 h-4 text-white" />
          </button>
          <button 
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="お気に入り"
          >
            <Star className="w-4 h-4 text-white" />
          </button>
          <button 
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title="ヘルプ"
          >
            <HelpCircle className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={() => setShowRequirementEditor(!showRequirementEditor)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title={showRequirementEditor ? "ドキュメントを閉じる" : "ドキュメントを開く"}
          >
            {showRequirementEditor ? (
              <Minimize2 className="w-4 h-4 text-white" />
            ) : (
              <Maximize2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 h-screen"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface */}
      <div className="flex-1 flex">
        {/* Chat Interface */}
        <div className={cn(
          "flex flex-col bg-gray-950 transition-all duration-300 relative",
          showRequirementEditor ? "w-1/2" : "w-full"
        )}>

          {/* Messages Area - Centered with bottom padding for fixed input */}
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-2xl rounded-lg relative group",
                      message.role === 'user'
                        ? "bg-blue-600 text-white px-4 py-3"
                        : "bg-gray-900 border border-gray-700 p-0 overflow-hidden"
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="relative">
                        <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <span>ツールを使用する</span>
                            <Badge className="text-xs" variant="secondary">
                              {agentOptions.find(a => a.value === message.agent_type)?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setShowRequirementEditor(true)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors"
                              title="要件定義書を開く"
                            >
                              <FileText className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <pre className="p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap overflow-x-auto">
                          <code>{message.content}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input Area at Bottom - With Background */}
          <div className={cn(
            "fixed bottom-0 left-0 right-0 z-30",
            showRequirementEditor ? "right-1/2" : ""
          )}>
            <div className="bg-gray-950 px-6 pt-6 pb-6">
              <div className="max-w-4xl mx-auto">
                {/* Input Field with Tabs */}
                <div className="relative bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
                {/* Tab Header */}
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex bg-gray-700 rounded-lg p-1">
                      <button className="px-3 py-1 text-xs rounded bg-gray-600 text-white">
                        AIドキュメント
                      </button>
                    </div>
                  </div>
                  
                  {/* Agent Selector */}
                  <div className="flex gap-1">
                    {agentOptions.map((agent) => (
                      <button
                        key={agent.value}
                        onClick={() => setSelectedAgent(agent.value as AgentType)}
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          selectedAgent === agent.value
                            ? "bg-gray-600 " + agent.color
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        )}
                        title={agent.label}
                      >
                        <agent.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Input with send button */}
                <div className="relative p-4">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="ここにドキュメントリクエストを入力..."
                    className="w-full min-h-[60px] max-h-[200px] resize-none bg-transparent border-none text-white placeholder-gray-400 focus:outline-none pr-12"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <Button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 p-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Requirements Editor */}
        <AnimatePresence>
          {showRequirementEditor && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="border-l border-gray-800 overflow-hidden"
            >
              <div className="relative h-full">
                {/* Document Header */}
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">要件定義書</span>
                  </div>
                  <button
                    onClick={() => setShowRequirementEditor(false)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <RequirementEditor chatId={chatId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}