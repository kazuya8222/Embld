'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowUp, ArrowRight, Check, PanelLeft } from 'lucide-react';
import { Sidebar } from './common/Sidebar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ServiceItem {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

type BuildStep = 'initial' | 'overview' | 'problem' | 'ideal' | 'solution' | 'features' | 'name' | 'review';

const STEP_TITLES: Record<BuildStep, string> = {
  initial: '初期入力',
  overview: 'サービス概要',
  problem: '課題',
  ideal: '理想',
  solution: '解決策',
  features: '機能詳細',
  name: 'サービス名',
  review: '最終確認'
};

const STEP_PROMPTS: Record<BuildStep, string> = {
  initial: 'どんなサービスを作りたいですか？簡単で構いませんので、アイデアを教えてください。',
  overview: 'サービス概要を生成しました。修正すべき点はありますか？',
  problem: '課題を生成しました。修正すべき点はありますか？',
  ideal: '理想を生成しました。修正すべき点はありますか？',
  solution: '解決策を生成しました。修正すべき点はありますか？',
  features: '機能詳細を生成しました。修正すべき点はありますか？',
  name: 'サービス名を生成しました。修正すべき点はありますか？',
  review: '全ての項目が完成しました。最終確認をお願いします。'
};

interface ServiceBuilderInterfaceProps {
  initialUserIdea?: string;
}

export function ServiceBuilderInterface({ initialUserIdea }: ServiceBuilderInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<BuildStep>(initialUserIdea ? 'overview' : 'initial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialIdea, setInitialIdea] = useState(initialUserIdea || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [userModifications, setUserModifications] = useState<Record<string, string[]>>({});
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    { id: 'overview', title: 'サービス概要', content: '', completed: false },
    { id: 'problem', title: '課題', content: '', completed: false },
    { id: 'ideal', title: '理想', content: '', completed: false },
    { id: 'solution', title: '解決策', content: '', completed: false },
    { id: 'features', title: '機能詳細', content: '', completed: false },
    { id: 'name', title: 'サービス名', content: '', completed: false }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    if (currentStep === 'initial' && !initialUserIdea) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: STEP_PROMPTS.initial,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (initialUserIdea && currentStep === 'overview') {
      // If we have an initial idea from props, start generating overview immediately
      const generateInitialOverview = async () => {
        setIsLoading(true);
        
        const userMessage: Message = {
          id: 'initial-user',
          content: initialUserIdea,
          role: 'user',
          timestamp: new Date()
        };
        
        const assistantMessage: Message = {
          id: 'initial-assistant',
          content: 'ありがとうございます！サービス概要を生成しています...',
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages([userMessage, assistantMessage]);
        
        const overview = await generateServiceItem('overview', { 
          initialIdea: initialUserIdea,
          previousItems: [],
          userFeedback: []
        });
        
        if (overview) {
          updateServiceItem('overview', overview);
          setSelectedTab('overview'); // タブも切り替え
          
          const completeMessage: Message = {
            id: 'overview-complete',
            content: STEP_PROMPTS.overview,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completeMessage]);
        }
        
        setIsLoading(false);
      };
      
      generateInitialOverview();
    }
  }, []);

  const generateServiceItem = async (step: string, previousData: any) => {
    try {
      const response = await fetch('/api/service-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          initialIdea: previousData.initialIdea || initialIdea,
          previousData,
          currentItems: serviceItems,
          userModifications: userModifications[step] || [],
          userFeedback: previousData.userFeedback || []
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Generation error:', error);
      return null;
    }
  };

  const updateServiceItem = (itemId: string, content: string) => {
    setServiceItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, content, completed: true }
        : item
    ));
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
    setIsLoading(true);

    try {
      if (currentStep === 'initial' && !initialUserIdea) {
        // initialUserIdeaがない場合のみ初期処理を実行
        setInitialIdea(currentInput);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'ありがとうございます！サービス概要を生成しています...',
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Pass the current input directly since state hasn't updated yet
        const overview = await generateServiceItem('overview', { 
          initialIdea: currentInput,
          previousItems: [],
          userFeedback: []
        });
        
        if (overview) {
          updateServiceItem('overview', overview);
          setCurrentStep('overview');
          setSelectedTab('overview'); // タブも切り替え
          
          const completeMessage: Message = {
            id: 'overview-complete-send',
            content: STEP_PROMPTS.overview,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completeMessage]);
        }
      } else if (currentStep !== 'review') {
        const currentItemId = currentStep;
        const currentItem = serviceItems.find(item => item.id === currentItemId);
        
        if (currentItem && currentInput.toLowerCase() !== '次へ' && currentInput !== '') {
          // Store user modifications
          setUserModifications(prev => ({
            ...prev,
            [currentItemId]: [...(prev[currentItemId] || []), currentInput]
          }));
          
          // Regenerate the item with user feedback
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: '修正内容を反映して再生成しています...',
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          
          const regeneratedContent = await generateServiceItem(currentItemId, {
            initialIdea,
            previousItems: serviceItems.filter(item => item.completed),
            userFeedback: [...(userModifications[currentItemId] || []), currentInput]
          });
          
          if (regeneratedContent) {
            updateServiceItem(currentItemId, regeneratedContent);
            
            const completeMessage: Message = {
              id: (Date.now() + 2).toString(),
              content: '修正を反映しました。他に修正点があれば入力してください。なければ「次へ」ボタンを押してください。',
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, completeMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    
    const steps: BuildStep[] = ['overview', 'problem', 'ideal', 'solution', 'features', 'name'];
    const currentIndex = steps.indexOf(currentStep as BuildStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      
      const generatingMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `${STEP_TITLES[nextStep]}を生成しています...`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, generatingMessage]);
      
      const content = await generateServiceItem(nextStep, {
        initialIdea,
        previousItems: serviceItems.filter(item => item.completed),
        userModifications: userModifications
      });
      
      if (content) {
        updateServiceItem(nextStep, content);
        setCurrentStep(nextStep);
        setSelectedTab(nextStep); // タブも自動で切り替え
        
        const completeMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: STEP_PROMPTS[nextStep],
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completeMessage]);
      }
    } else {
      setCurrentStep('review');
      const reviewMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: STEP_PROMPTS.review,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reviewMessage]);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/proposals/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceItems })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/proposals/${data.proposalId}`;
      } else {
        console.error('Save error:', await response.text());
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };


  return (
    <div className="h-screen flex bg-gray-900 relative overflow-hidden">
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

      <div className="flex-1 flex">
        <div className="w-1/2 bg-gray-900 flex flex-col">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleMenuToggle}
              onMouseEnter={() => handleMenuHover(true)}
              onMouseLeave={() => handleMenuHover(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-medium text-gray-300">{initialIdea || "開発案件定義支援AIの構想と目標"}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                    {message.role === 'user' ? (
                      <div className="px-4 py-2 rounded-lg bg-gray-700 text-gray-100">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ) : (
                      <div className="text-gray-100">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-4"
              >
                <div className="mr-auto max-w-[85%]">
                  <div className="text-gray-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Embld にメッセージを送る"
                className="w-full h-12 pl-4 pr-16 bg-gray-700 border-0 rounded-full text-white placeholder:text-gray-400 focus:outline-none focus:ring-0"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="absolute right-1">
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-black p-0"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-gray-900 flex flex-col p-4">
          <div className="bg-gray-800 rounded-lg flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-700 bg-gray-750 px-4 py-2 flex items-center justify-center rounded-t-lg">
              <span className="text-sm text-gray-300">要件定義書</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-850">
              {/* Editor-style content */}
              <div className="h-full font-mono text-sm">
                {/* Tab bar */}
                <div className="bg-gray-800 border-b border-gray-700 px-4 py-1 flex items-center gap-1 overflow-x-auto">
                  {serviceItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedTab(item.id)}
                      className={`px-3 py-1 rounded-t text-xs text-gray-300 whitespace-nowrap ${
                        selectedTab === item.id 
                          ? 'bg-gray-700 border-b-2 border-blue-500' 
                          : 'bg-gray-850 hover:bg-gray-750'
                      }`}
                    >
                      {index === 0 && 'サービス概要'}
                      {index === 1 && '課題'}
                      {index === 2 && '理想'}
                      {index === 3 && '解決策'}
                      {index === 4 && '機能詳細'}
                      {index === 5 && 'サービス名'}
                    </button>
                  ))}
                </div>
                
                {/* Editor content */}
                <div className="p-4 text-gray-300 leading-relaxed">
                  {serviceItems
                    .filter(item => item.id === selectedTab)
                    .map((item, index) => (
                      <div key={item.id}>
                        <div className="text-orange-400 mb-4 text-lg">
                          {item.title}
                        </div>
                        {item.content ? (
                          <div className="whitespace-pre-wrap text-gray-300">
                            {item.content.split('\n').map((line, i) => (
                              <div key={i} className="mb-2">
                                {line}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">生成中...</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              {currentStep === 'review' ? (
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3"
                  size="lg"
                >
                  企画書として保存
                </Button>
              ) : currentStep !== 'initial' && (
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="w-full bg-gray-700 text-white hover:bg-gray-600 py-3"
                  size="lg"
                >
                  次の項目へ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}