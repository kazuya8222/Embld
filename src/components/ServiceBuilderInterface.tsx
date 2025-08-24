'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Bot, User, ArrowRight, Check, Sparkles } from 'lucide-react';

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
      if (currentStep === 'initial') {
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
          
          const completeMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: STEP_PROMPTS.overview,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completeMessage]);
          setCurrentStep('overview');
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
        
        const completeMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: STEP_PROMPTS[nextStep],
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completeMessage]);
        setCurrentStep(nextStep);
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
      const response = await fetch('/api/service-builder/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceItems })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/ideas/${data.ideaId}`;
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };


  return (
    <div className="h-screen flex bg-gray-900">
      <div className="flex-1 flex">
        <div className="w-1/2 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="border-b border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">サービス構築チャット</h2>
            <p className="text-sm text-gray-400 mt-1">AIと対話しながらサービスを作り上げます</p>
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
                  <div className={`max-w-[85%] flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-gray-700'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-700 px-4 py-2 rounded-lg">
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

          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentStep === 'initial' ? 'サービスのアイデアを入力...' : 'メッセージを入力...'}
                className="flex-1 min-h-[80px] resize-none bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {currentStep !== 'initial' && currentStep !== 'review' && (
              <Button
                onClick={handleNextStep}
                disabled={isLoading}
                className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                次の項目へ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        <div className="w-1/2 bg-gray-800 flex flex-col">
          <div className="border-b border-gray-700 bg-gray-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">生成されたサービス企画</h2>
            <div className="flex items-center gap-2 mt-2">
              {serviceItems.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  <div className={`flex items-center gap-1 ${item.completed ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                      item.completed ? 'border-green-600 bg-green-50' : 'border-gray-300'
                    }`}>
                      {item.completed ? <Check className="w-3 h-3" /> : index + 1}
                    </div>
                    <span className="text-xs">{item.title}</span>
                  </div>
                  {index < serviceItems.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${item.completed ? 'bg-green-600' : 'bg-gray-600'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {serviceItems.map((item) => (
                <Card key={item.id} className={`transition-all bg-gray-700 ${item.completed ? 'border-green-600/30 shadow-sm' : 'border-gray-600 opacity-60'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2 text-white">
                        {item.completed && <Check className="w-4 h-4 text-green-500" />}
                        {item.title}
                      </CardTitle>
                      {item.completed && (
                        <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">
                          <Check className="w-3 h-3 mr-1" />
                          完了
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.content ? (
                      <div className="text-sm text-gray-300 whitespace-pre-wrap">{item.content}</div>
                    ) : (
                      <div className="text-sm text-gray-500">まだ生成されていません</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {currentStep === 'review' && (
              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  企画書として保存
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}