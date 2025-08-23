'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Bot, User, Search, ExternalLink, FileText, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  suggestedApps?: SuggestedApp[];
  showPlanButton?: boolean;
}

interface SuggestedApp {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  owner_name: string;
}

const EXAMPLE_PROMPTS = [
  "タスク管理ができるアプリが欲しい",
  "写真を整理できるサービス",
  "友達と予定を共有したい",
  "家計簿アプリを探している"
];

const CLARIFYING_QUESTIONS = [
  "どのような場面で使用することを想定していますか？",
  "主なユーザーは誰になりますか？",
  "似たようなサービスで気に入らない点はありますか？",
  "必須の機能はありますか？",
  "どのようなデバイスで使いたいですか？"
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialState, setIsInitialState] = useState(true);
  const [conversationStep, setConversationStep] = useState<'initial' | 'clarifying' | 'searching' | 'complete'>('initial');
  const [userRequirements, setUserRequirements] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 新しいメッセージが追加された時のみスクロール（入力変更時は除外）
  useEffect(() => {
    if (messages.length > 0) {
      // 少し遅延を入れてスムーズにスクロール
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]); // messages.lengthの変更時のみトリガー

  const searchSimilarApps = async (requirements: string[]): Promise<SuggestedApp[]> => {
    try {
      const response = await fetch('/api/search-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements })
      });
      
      if (!response.ok) return [];
      const data = await response.json();
      return data.apps || [];
    } catch (error) {
      console.error('App search error:', error);
      return [];
    }
  };

  const generateClarifyingQuestion = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/clarify-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          previousRequirements: userRequirements
        })
      });

      if (!response.ok) {
        return CLARIFYING_QUESTIONS[Math.floor(Math.random() * CLARIFYING_QUESTIONS.length)];
      }

      const data = await response.json();
      return data.question || CLARIFYING_QUESTIONS[Math.floor(Math.random() * CLARIFYING_QUESTIONS.length)];
    } catch (error) {
      return CLARIFYING_QUESTIONS[Math.floor(Math.random() * CLARIFYING_QUESTIONS.length)];
    }
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    setIsInitialState(false);

    // Add current input to requirements
    setUserRequirements(prev => [...prev, currentInput]);

    try {
      if (conversationStep === 'initial') {
        // Initial message - start clarifying
        setConversationStep('clarifying');
        
        const welcomeMessage: Message = {
          id: 'welcome',
          content: '素晴らしいアイデアですね！✨\n\nより具体的な要件を整理するために、いくつか質問させてください。',
          role: 'assistant',
          timestamp: new Date()
        };
        
        setTimeout(async () => {
          setMessages(prev => [...prev, welcomeMessage]);
          
          const question = await generateClarifyingQuestion(currentInput);
          const questionMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: question,
            role: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, questionMessage]);
          setIsTyping(false);
        }, 1000);
        
      } else if (conversationStep === 'clarifying') {
        // Continue clarifying or move to search
        if (userRequirements.length >= 3) {
          // Enough information gathered, search for apps
          setConversationStep('searching');
          
          setTimeout(async () => {
            const searchingMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: '要件が整理できました！🎯\n\n類似するアプリを検索しています...',
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, searchingMessage]);
            
            const suggestedApps = await searchSimilarApps(userRequirements);
            
            if (suggestedApps.length > 0) {
              const resultMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: `${suggestedApps.length}件の類似アプリを見つけました！\n\n既存のアプリで要件を満たせる場合もありますので、まずは確認してみてください。もし既存アプリでは物足りない場合は、オリジナルの企画書を作成しましょう。`,
                role: 'assistant',
                timestamp: new Date(),
                suggestedApps,
                showPlanButton: true
              };
              
              setMessages(prev => [...prev, resultMessage]);
              setConversationStep('complete');
            } else {
              const noResultMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: '類似するアプリは見つかりませんでした。\n\n素晴らしいアイデアです！既存にない新しいサービスの可能性があります。企画書を作成して、あなたのアイデアを形にしましょう！',
                role: 'assistant',
                timestamp: new Date(),
                showPlanButton: true
              };
              
              setMessages(prev => [...prev, noResultMessage]);
              setConversationStep('complete');
            }
            
            setIsTyping(false);
          }, 1000);
          
        } else {
          // Ask another clarifying question
          setTimeout(async () => {
            const question = await generateClarifyingQuestion(currentInput);
            const questionMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: question,
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, questionMessage]);
            setIsTyping(false);
          }, 1000);
        }
        
      } else {
        // Conversation complete, general response
        setTimeout(() => {
          const generalMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: 'ありがとうございます！他にご質問があれば、お気軽にどうぞ。企画書作成の準備ができましたら、下のボタンからお進みください。',
            role: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, generalMessage]);
          setIsTyping(false);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
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

  if (isInitialState) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              どんなアプリが
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                欲しいですか？
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              なんとなくのアイデアでも大丈夫です。
              <br />
              AIが対話を通じて要件を整理し、最適なソリューションをご提案します。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            {/* Example prompts */}
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-4 font-medium">
                💡 例えばこんな感じで...
              </p>
              <div className="flex flex-wrap gap-3">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors border border-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="欲しいアプリやサービスについて、自由に話してください..."
                className="min-h-[120px] text-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
              />
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Enter で送信 • Shift + Enter で改行
                </p>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="h-[60px] px-6 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isTyping ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">相談開始</span>
                      <Send className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">アプリ相談チャット</h1>
          <p className="text-gray-600">AIがあなたの要望を整理し、最適なソリューションを提案します</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6 overflow-y-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-500' : 'bg-gray-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Suggested Apps */}
                        {message.suggestedApps && message.suggestedApps.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {message.suggestedApps.map((app) => (
                              <div key={app.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-start gap-3">
                                  {app.image_url && (
                                    <img src={app.image_url} alt={app.title} className="w-12 h-12 rounded-lg object-cover" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{app.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{app.description}</p>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{app.category}</Badge>
                                        <span className="text-xs text-gray-500">by {app.owner_name}</span>
                                      </div>
                                      <Link 
                                        href={`/owners/${app.id}`}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                      >
                                        詳細
                                        <ExternalLink className="w-3 h-3" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Plan Creation Button */}
                        {message.showPlanButton && (
                          <div className="mt-4">
                            <Link 
                              href="/ideas/new"
                              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              企画書を作成する
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="メッセージを入力..."
              className="flex-1 min-h-[60px] border-gray-300 focus:border-blue-500 resize-none"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}