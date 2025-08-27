'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowUp, ChevronDown, Zap, Bot } from 'lucide-react';

interface SearchBarProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
}

const modelOptions = [
  { id: 'simple', label: 'シンプル', icon: Zap, description: '高速で軽量なモデル' },
  { id: 'agent', label: 'AIエージェント', icon: Bot, description: '高度な分析と提案' }
];

export function SearchBar({ onSubmit, placeholder = "どんなアプリが欲しいですか？" }: SearchBarProps) {
  const [input, setInput] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [selectedModel, setSelectedModel] = useState('simple');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setIsConfirmed(false);
    }
  };

  const selectedModelOption = modelOptions.find(option => option.id === selectedModel);
  const CurrentIcon = selectedModelOption?.icon || Zap;

  // ドロップダウン外部クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    }

    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      if (!isConfirmed) {
        // 1回目のEnter：確定
        setIsConfirmed(true);
        
        // 既存のタイムアウトをクリア
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // 3秒後にリセット
        const id = setTimeout(() => {
          setIsConfirmed(false);
        }, 3000);
        setTimeoutId(id);
      } else {
        // 2回目のEnter：送信
        handleSubmit();
        setIsConfirmed(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`bg-[#2a2a2a] backdrop-blur-sm rounded-2xl border ${isConfirmed ? 'border-blue-500' : 'border-[#3a3a3a]'} transition-colors duration-200`}>
        <div className="flex items-end px-4 pt-3 pb-1">
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // テキストが変更されたら確定状態をリセット
              if (isConfirmed) {
                setIsConfirmed(false);
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  setTimeoutId(null);
                }
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={isConfirmed ? "もう一度Enterキーで送信" : placeholder}
            className="flex-1 min-h-[60px] text-lg bg-transparent border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-[#e0e0e0] placeholder:text-[#a0a0a0] pr-4"
          />
          
          <div className="flex items-center gap-3">
            {/* モデル選択ボタン */}
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] px-3 py-2 text-sm"
              >
                <span>{selectedModelOption?.label}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
              
              {/* ドロップダウンメニュー */}
              {showModelDropdown && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-lg z-10">
                  {modelOptions.map((option) => {
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedModel(option.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full flex items-start gap-3 p-3 text-left hover:bg-[#3a3a3a] transition-colors ${
                          selectedModel === option.id ? 'bg-[#3a3a3a]' : ''
                        }`}
                      >
                        <OptionIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-[#e0e0e0] text-sm font-medium">{option.label}</div>
                          <div className="text-[#a0a0a0] text-xs">{option.description}</div>
                        </div>
                        {selectedModel === option.id && (
                          <div className="ml-auto text-blue-400">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#f0f0f0] text-black p-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}