'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Sparkles, Zap, Rocket, Target, Menu } from 'lucide-react';
import { ServiceBuilderInterface } from './ServiceBuilderInterface';
import { TopBar } from './common/TopBar';
import { Sidebar } from './common/Sidebar';
import { SearchBar } from './home/SearchBar';
import { CommunityShowcase } from './home/CommunityShowcase';
import { useAuth } from './auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function ServiceBuilderHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [isBuilding, setIsBuilding] = useState(false);
  const [initialIdea, setInitialIdea] = useState('');
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isBuilding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isBuilding]);

  const handleSubmit = async (value?: string) => {
    const ideaValue = value || input;
    if (ideaValue.trim()) {
      try {
        // First check if user has enough credits
        const checkResponse = await fetch('/api/chat/sessions', {
          method: 'GET'
        });
        
        if (checkResponse.status === 401) {
          router.push('/auth/login');
          return;
        }
        
        const checkData = await checkResponse.json();
        
        if (!checkData.canStart) {
          alert(`クレジットが不足しています。\nAIエージェントチャットの開始には${checkData.creditCost}クレジットが必要です。\n現在のクレジット: ${checkData.currentCredits}`);
          return;
        }
        
        // Skip confirmation dialog - proceed directly
        
        // Create new chat session with credit deduction
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: ideaValue.length > 50 ? ideaValue.substring(0, 50) + '...' : ideaValue,
            initialMessage: ideaValue
          })
        });
        
        if (response.status === 402) {
          const data = await response.json();
          alert(`クレジットが不足しています。\n必要クレジット: ${data.required}\n現在のクレジット: ${data.current}`);
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Chat session creation failed:', response.status, errorData);
          throw new Error(`Failed to create chat session: ${errorData.error || response.statusText}`);
        }
        
        const { session, remainingCredits } = await response.json();
        
        if (session) {
          // Navigate to the new chat
          router.push(`/agents/${session.id}`);
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
        alert('チャットの開始に失敗しました。もう一度お試しください。');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
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


  return (
    <div className="min-h-screen bg-[#1a1a1a] relative">
      {/* TopBar */}
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
      
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

      {/* Main Content */}
      <div className="min-h-screen pt-0 relative">

        <div className="relative z-10">
          {/* Header Section */}
          <div className="pt-48 pb-8">
            <div className="text-center px-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#e0e0e0] mb-6">
どんなアプリが欲しいですか？
              </h1>
            </div>
            
            {/* Search Bar */}
            <div className="px-4">
              <SearchBar onSubmit={handleSubmit} placeholder="欲しいアプリを一言で書いてください。" />
            </div>
          </div>

          {/* Community Showcase Section */}
          <div className="pb-8 pt-16">
            <CommunityShowcase />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}