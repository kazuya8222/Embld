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

export function ServiceBuilderHome() {
  const { user } = useAuth();
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

  const handleSubmit = (value?: string) => {
    const ideaValue = value || input;
    if (ideaValue.trim()) {
      setInitialIdea(ideaValue);
      setIsBuilding(true);
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

  if (isBuilding) {
    return <ServiceBuilderInterface initialUserIdea={initialIdea} />;
  }

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
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
      <div className="h-full pt-0 relative">

        <div className="relative z-10 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex-shrink-0 pt-32 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-white mb-6"
              >
どんなアプリが欲しいですか？
              </motion.h1>
            </motion.div>
            
            {/* Search Bar */}
            <div className="px-4">
              <SearchBar onSubmit={handleSubmit} placeholder="欲しいアプリを一言で書いてください。" />
            </div>
          </div>

          {/* Community Showcase Section */}
          <div className="flex-1 overflow-y-auto pb-8">
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