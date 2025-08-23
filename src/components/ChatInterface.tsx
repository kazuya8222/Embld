'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Bot, User, Search, ExternalLink, FileText, ArrowRight, Sparkles, CheckCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface QuestionScreen {
  id: string;
  question: string;
  userAnswer?: string;
  timestamp: Date;
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

interface ChatInterfaceProps {
  onScreenChange?: (screen: 'welcome' | 'question' | 'result') => void;
}

export function ChatInterface({ onScreenChange }: ChatInterfaceProps) {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'question' | 'result'>('welcome');
  const [questions, setQuestions] = useState<QuestionScreen[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRequirements, setUserRequirements] = useState<string[]>([]);
  const [suggestedApps, setSuggestedApps] = useState<SuggestedApp[]>([]);
  const [isComplete, setIsComplete] = useState(false);

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

  const handleStartChat = async () => {
    if (input.trim() === '') return;

    setIsLoading(true);
    const userAnswer = input.trim();
    setUserRequirements(prev => [...prev, userAnswer]);

    // 最初の質問を生成
    try {
      const question = await generateClarifyingQuestion(userAnswer);
      const firstQuestion: QuestionScreen = {
        id: Date.now().toString(),
        question,
        timestamp: new Date()
      };
      
      setQuestions([firstQuestion]);
      setCurrentQuestionIndex(0);
      setCurrentScreen('question');
      onScreenChange?.('question');
      setInput('');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
    
    setIsLoading(false);
  };

  const handleAnswerQuestion = async () => {
    if (input.trim() === '') return;

    setIsLoading(true);
    const userAnswer = input.trim();
    
    // 現在の質問に答えを追加
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].userAnswer = userAnswer;
    setQuestions(updatedQuestions);
    setUserRequirements(prev => [...prev, userAnswer]);

    // 十分な情報が集まったかチェック
    if (userRequirements.length >= 2) { // 初回 + 2回の質問 = 計3回
      // 結果画面に移動
      const apps = await searchSimilarApps([...userRequirements, userAnswer]);
      setSuggestedApps(apps);
      setIsComplete(true);
      setCurrentScreen('result');
      onScreenChange?.('result');
    } else {
      // 次の質問を生成
      try {
        const question = await generateClarifyingQuestion(userAnswer);
        const nextQuestion: QuestionScreen = {
          id: (Date.now() + 1).toString(),
          question,
          timestamp: new Date()
        };
        
        setQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      } catch (error) {
        console.error('Error generating question:', error);
      }
    }
    
    setInput('');
    setIsLoading(false);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setInput(questions[currentQuestionIndex - 1].userAnswer || '');
    } else {
      setCurrentScreen('welcome');
      onScreenChange?.('welcome');
      setQuestions([]);
      setUserRequirements([]);
      setInput('');
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <AnimatePresence>
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto px-6"
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                どんなアプリが
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  欲しいですか？
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                なんとなくのアイデアでも大丈夫です。
                <br />
                AIが質問を通じて要件を整理します。
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Example prompts */}
              <div className="mb-6">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleStartChat();
                    }
                  }}
                  placeholder="欲しいアプリやサービスについて、自由に話してください..."
                  className="min-h-[120px] text-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                  disabled={isLoading}
                />
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Enter で送信 • Shift + Enter で改行
                  </p>
                  <Button
                    onClick={handleStartChat}
                    disabled={!input.trim() || isLoading}
                    className="h-[60px] px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
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
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Question Screen
  if (currentScreen === 'question') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / 3) * 100;

    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* Header with progress */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                戻る
              </button>
              <span className="text-sm text-gray-500">
                質問 {currentQuestionIndex + 1} / 3
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl w-full"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-relaxed">
                  {currentQuestion?.question}
                </h2>
                <p className="text-gray-600">
                  より具体的な要件を把握するための質問です
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAnswerQuestion();
                      }
                    }}
                    placeholder="こちらに回答を入力してください..."
                    className="min-h-[120px] text-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                    disabled={isLoading}
                  />
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                      Enter で次へ • Shift + Enter で改行
                    </p>
                    <Button
                      onClick={handleAnswerQuestion}
                      disabled={!input.trim() || isLoading}
                      className="h-[60px] px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">次へ</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Result Screen
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <AnimatePresence>
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                要件整理が完了しました！
              </h1>
              <p className="text-xl text-gray-600">
                {suggestedApps.length > 0 
                  ? `${suggestedApps.length}件の類似アプリを発見しました`
                  : '新しいアイデアの可能性があります！'
                }
              </p>
            </div>

            {suggestedApps.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">類似アプリ</h2>
                <div className="space-y-4">
                  {suggestedApps.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {app.image_url && (
                          <img src={app.image_url} alt={app.title} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{app.title}</h3>
                          <p className="text-gray-600 mb-3 leading-relaxed">{app.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">{app.category}</Badge>
                              <span className="text-sm text-gray-500">作成者: {app.owner_name}</span>
                            </div>
                            <Link 
                              href={`/owners/${app.id}`}
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              詳細を見る
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {suggestedApps.length > 0 
                  ? '既存アプリで満足できませんか？'
                  : 'あなたのアイデアを形にしましょう！'
                }
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                {suggestedApps.length > 0 
                  ? '既存のアプリでは物足りない場合は、オリジナルの企画書を作成して、あなたの理想のアプリを実現させましょう。'
                  : '類似するアプリが見つからないということは、新しい価値を生み出すチャンスです。企画書を作成してアイデアを具体化しましょう。'
                }
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setCurrentScreen('welcome');
                    onScreenChange?.('welcome');
                    setQuestions([]);
                    setUserRequirements([]);
                    setSuggestedApps([]);
                    setIsComplete(false);
                    setInput('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  最初からやり直す
                </button>
                
                <Link 
                  href="/ideas/new"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  企画書を作成する
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}