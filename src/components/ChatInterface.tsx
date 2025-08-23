'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Bot, User, Lightbulb, FileText, Zap, Sparkles, Star, ArrowRight, MessageSquare, Code2, Target, Rocket, Terminal, GitBranch, Settings, Cpu, ExternalLink, Github, Globe, Smartphone, Monitor } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Suggestion {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const MOCK_RESPONSES = [
  "✨ 素晴らしいアイデアです！具体的な機能要件を一緒に定義していきましょう。どのような技術スタックをお考えですか？",
  "🎯 興味深いコンセプトですね。ユーザーエクスペリエンスの観点から、どのような課題を解決したいでしょうか？",
  "🚀 その機能は技術的に実現可能です。スケーラビリティやパフォーマンスについても考慮に入れましょう。",
  "💡 優れたアプローチです！アーキテクチャ設計の段階で、どのようなインフラストラクチャを想定していますか？",
  "📋 要件が明確になってきました。あなたの要求にマッチするおすすめのアプリケーションをご提案します！詳細な分析結果をご覧ください。"
];

const EXAMPLE_PROMPTS = [
  "リアルタイム協業ツール",
  "AI搭載学習プラットフォーム",
  "クラウドベースタスク管理",
  "マイクロサービスECサイト"
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInitialState, setIsInitialState] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsInitialState(false);

    // Add welcome message if this is the first message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: '🎉 素晴らしいプロジェクトのスタートですね！\n\n⚡ あなたの構想を実現可能な技術仕様に落とし込み、最適なソリューションを一緒に設計していきましょう。',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }

    // Simulate AI response delay
    setTimeout(() => {
      const responseContent = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Show suggestions after more conversation
      if (messages.length >= 4) {
        setShowSuggestions(true);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const suggestions: Suggestion[] = [
    {
      title: "Market Analysis",
      description: "競合分析とトレンド調査による市場ポジショニング",
      icon: <Target className="w-6 h-6" />,
      color: "bg-blue-500",
      action: () => {
        const suggestionMessage: Message = {
          id: Date.now().toString(),
          content: "🎯 市場分析を開始します。競合製品の技術スタック、価格戦略、ユーザーレビューを分析し、差別化ポイントを特定しましょう。",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, suggestionMessage]);
        setShowSuggestions(false);
      }
    },
    {
      title: "Technical Specification",
      description: "アーキテクチャ設計と技術仕様の詳細定義",
      icon: <Code2 className="w-6 h-6" />,
      color: "bg-green-500",
      action: () => {
        const planMessage: Message = {
          id: Date.now().toString(),
          content: "⚙️ 技術仕様書の作成を開始します。システムアーキテクチャ、API設計、データベース設計、セキュリティ要件を詳細に定義していきます。",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, planMessage]);
        setShowSuggestions(false);
      }
    },
    {
      title: "Development Roadmap",
      description: "開発フェーズとマイルストーンの戦略的計画",
      icon: <Rocket className="w-6 h-6" />,
      color: "bg-purple-500",
      action: () => {
        const requirementMessage: Message = {
          id: Date.now().toString(),
          content: "🚀 開発ロードマップを策定します。MVP、フェーズ別機能リリース、チーム体制、タイムラインを含む包括的な開発計画を作成しましょう。",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, requirementMessage]);
        setShowSuggestions(false);
      }
    }
  ];

  if (isInitialState) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(0,0,0,0.02)_1px,_transparent_1px),_linear-gradient(-45deg,_rgba(0,0,0,0.02)_1px,_transparent_1px)] bg-[size:20px_20px]" />
        </div>

        {/* Floating Code Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-gray-300"
              style={{
                left: `${20 + i * 15}%`,
                top: `${25 + (i % 2) * 20}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {[<Code2 key="code2" className="w-4 h-4" />, <Terminal key="terminal" className="w-4 h-4" />, <GitBranch key="gitbranch" className="w-4 h-4" />, <Settings key="settings" className="w-4 h-4" />, <Cpu key="cpu" className="w-4 h-4" />][i]}
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 pt-16 pb-12 px-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="inline-flex items-center gap-6 mb-12"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-16 h-16 rounded-lg bg-gray-900 flex items-center justify-center shadow-xl">
                <Code2 className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent" />
              </div>
              <div className="text-left">
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    ✨ 実現可能
                  </Badge>
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-900">
                  EmBld
                </h1>
                <p className="text-lg text-gray-600 mt-1">欲しいが手に入る</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                どんなアプリを
                <br />
                <span className="text-blue-600 flex items-center justify-center gap-3">
                  構築したいですか？
                  <Terminal className="w-12 h-12 text-blue-600" />
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                あなたのアイデアを実装可能な技術仕様に。
                <br className="hidden sm:block" />
                最適なアーキテクチャで理想のアプリケーションを設計しましょう。
              </p>
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 border border-gray-200"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">テクノロジーでアイデアを現実に</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 flex-1 flex items-center justify-center px-8"
        >
          <div className="w-full max-w-4xl mx-auto">
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8 overflow-hidden"
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <span className="text-lg font-medium text-gray-900">プロジェクト要件を入力してください</span>
                </div>

                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="例：リアルタイムチャット機能付きのコラボレーションツール、機械学習を活用した推薦システム、など..."
                    className="min-h-[120px] w-full resize-none bg-gray-50 border-gray-300 rounded-xl px-6 py-5 text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    技術解析AI、スタンバイ
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSend}
                      disabled={input.trim() === ''}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 border-0 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Build
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </motion.div>
                </div>

                {/* Example Prompts */}
                <motion.div 
                  className="pt-6 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    こんなプロジェクトはいかがですか？
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {EXAMPLE_PROMPTS.map((example, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="relative z-10 px-8 py-16"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                EmBldの
                <span className="text-blue-600">開発サポート機能</span>
              </h3>
              <p className="text-gray-600">プロフェッショナルな開発プロセスで理想を実現</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target className="w-8 h-8" />,
                  title: "要件分析",
                  description: "ビジネス要件を技術仕様に正確に変換",
                  color: "bg-blue-500"
                },
                {
                  icon: <Code2 className="w-8 h-8" />,
                  title: "アーキテクチャ設計",
                  description: "スケーラブルで保守性の高い設計を提案",
                  color: "bg-green-500"
                },
                {
                  icon: <Rocket className="w-8 h-8" />,
                  title: "実装ロードマップ",
                  description: "段階的な開発計画と技術選定をサポート",
                  color: "bg-purple-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-lg ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Chat Mode (GitHub-style interface)
  return (
    <div className="flex flex-col h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(0,0,0,0.02)_1px,_transparent_1px),_linear-gradient(-45deg,_rgba(0,0,0,0.02)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-6 relative">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <motion.div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {message.role === 'user' ? 
                    <User className="w-5 h-5 text-white" /> : 
                    <Bot className="w-5 h-5 text-white" />
                  }
                </motion.div>
                <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <motion.div 
                    className={`inline-block p-4 rounded-xl whitespace-pre-wrap shadow-sm border ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-auto border-blue-600'
                        : 'bg-white text-gray-900 border-gray-200'
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    {message.content}
                  </motion.div>
                  <motion.div 
                    className="text-xs text-gray-500 mt-2 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-1 h-1 rounded-full bg-green-500" />
                    {message.timestamp.toLocaleTimeString('ja-JP', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 max-w-2xl">
                <div className="inline-block p-4 rounded-xl bg-white shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay, i) => (
                      <motion.div 
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: delay / 1000
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <Badge className="px-4 py-2 bg-gray-900 text-white border-0 shadow-lg">
                      <Terminal className="w-4 h-4 mr-2" />
                      次の開発ステップ
                    </Badge>
                  </motion.div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group bg-white"
                        onClick={suggestion.action}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <motion.div 
                              className={`w-10 h-10 rounded-lg ${suggestion.color} flex items-center justify-center text-white shadow-md`}
                              whileHover={{ rotate: 5 }}
                            >
                              {suggestion.icon}
                            </motion.div>
                            <CardTitle className="text-base text-gray-900">
                              {suggestion.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-sm text-gray-600 leading-relaxed">
                            {suggestion.description}
                          </CardDescription>
                        </CardContent>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t border-gray-200 shadow-sm relative"
      >
        <div className="relative px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="プロジェクトの詳細や技術要件を入力してください..."
                  className="min-h-[60px] resize-none bg-gray-50 border-gray-300 rounded-lg px-4 py-3 text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={isTyping}
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleSend} 
                  disabled={input.trim() === '' || isTyping}
                  className="h-[60px] px-6 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
            <motion.div 
              className="text-sm text-gray-500 mt-3 text-center flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Enterで送信、Shift+Enterで改行 • 技術解析中
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}