'use client'

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Plus, ArrowUp, Shuffle } from 'lucide-react';

interface SearchBarProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSubmit, placeholder = "どんなアプリが欲しいですか？" }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [enterCount, setEnterCount] = useState(0);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      if (enterCount === 0) {
        // 1回目のEnter：確定
        setEnterCount(1);
        setTimeout(() => setEnterCount(0), 2000); // 2秒後にリセット
      } else if (enterCount === 1) {
        // 2回目のEnter：送信
        handleSubmit();
        setEnterCount(0);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-gray-800 backdrop-blur-sm rounded-2xl border border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-h-[60px] text-lg bg-transparent border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-white placeholder:text-gray-400"
          />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade notice */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>プランをアップグレードして、embldの全機能とより多くのクレジットを利用しましょう</span>
        <Button
          variant="link"
          className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm"
        >
          アップグレード ×
        </Button>
      </div>
    </motion.div>
  );
}