'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  Save,
  FileText,
  MessageSquare,
  Users,
  BarChart3,
  Building,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { InterviewState, Persona, Interview } from '@/lib/types/agent';

interface RequirementEditorProps {
  chatId: string;
  agentState?: InterviewState | null;
}

type EditorMode = 'rich' | 'markdown';

type TabType = 'overview' | 'personas' | 'interviews' | 'requirements' | 'analysis' | 'pitch';

export function RequirementEditor({ chatId, agentState }: RequirementEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('要件定義書');
  const [editorMode, setEditorMode] = useState<EditorMode>('rich');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadExistingProposal();
  }, [chatId]);

  useEffect(() => {
    // Auto-save when agent state changes (with debouncing)
    if (agentState) {
      const timeoutId = setTimeout(() => {
        saveAgentStateToProposals();
      }, 1000); // Wait 1 second before saving to avoid too many saves
      
      return () => clearTimeout(timeoutId);
    }
  }, [agentState]);

  const loadExistingProposal = async () => {
    try {
      // First try to load from proposals table
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('chat_session_id', chatId)
        .single();

      if (data) {
        setContent(data.content || '');
        setTitle(data.title || '要件定義書');
      } else {
        // If no existing proposal, save current agent state content
        if (agentState) {
          await saveAgentStateToProposals();
        }
      }
    } catch (error) {
      console.log('No existing proposal found');
      // If no existing proposal, save current agent state content
      if (agentState) {
        await saveAgentStateToProposals();
      }
    }
  };

  const saveAgentStateToProposals = async () => {
    if (!user || !agentState) return;

    const proposalContent = {
      overview: formatServiceOverview(agentState),
      personas: formatPersonas(agentState.personas || []),
      interviews: formatInterviews(agentState.interviews || []),
      requirements: agentState.professional_requirements_doc || '',
      analysis: formatAnalysisReport(agentState.consultant_analysis_report),
      pitch: agentState.pitch_document || ''
    };

    try {
      const { error } = await supabase
        .from('proposals')
        .upsert([{
          user_id: user.id,
          title: '要件定義書',
          content: JSON.stringify(proposalContent),
          chat_session_id: chatId,
          status: 'draft',
          metadata: {
            agent_state_snapshot: agentState,
            last_updated: new Date().toISOString()
          }
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving agent state to proposals:', error);
    }
  };

  const saveToProposals = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Check if proposal already exists
      const { data: existing } = await supabase
        .from('proposals')
        .select('id')
        .eq('chat_session_id', chatId)
        .single();

      if (existing) {
        // Update existing proposal
        const { error } = await supabase
          .from('proposals')
          .update({
            title,
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new proposal
        const { error } = await supabase
          .from('proposals')
          .insert([{
            user_id: user.id,
            title,
            content,
            chat_session_id: chatId,
            status: 'draft'
          }]);

        if (error) throw error;
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving proposal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertList = (ordered: boolean) => {
    formatText(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: '太字' },
    { icon: Italic, command: 'italic', title: '斜体' },
    { icon: Underline, command: 'underline', title: '下線' },
    { icon: Strikethrough, command: 'strikethrough', title: '取り消し線' },
  ];

  const alignButtons = [
    { icon: AlignLeft, command: 'justifyLeft', title: '左揃え' },
    { icon: AlignCenter, command: 'justifyCenter', title: '中央揃え' },
    { icon: AlignRight, command: 'justifyRight', title: '右揃え' },
  ];

  const tabs: { id: TabType; label: string; icon: React.ComponentType<any>; }[] = [
    { id: 'overview', label: 'サービス概要', icon: MessageSquare },
    { id: 'personas', label: 'ペルソナ', icon: Users },
    { id: 'interviews', label: 'インタビュー結果', icon: FileText },
    { id: 'requirements', label: '統合要件定義書', icon: FileCheck },
    { id: 'analysis', label: '外部環境分析レポート', icon: BarChart3 },
    { id: 'pitch', label: 'プロジェクト企画書', icon: Building }
  ];

  const getTabContent = (tab: TabType): string => {
    if (!agentState) return '';

    switch (tab) {
      case 'overview':
        return formatServiceOverview(agentState);
      case 'personas':
        return formatPersonas(agentState.personas || []);
      case 'interviews':
        return formatInterviews(agentState.interviews || []);
      case 'requirements':
        return agentState.professional_requirements_doc || '';
      case 'analysis':
        return formatAnalysisReport(agentState.consultant_analysis_report);
      case 'pitch':
        return agentState.pitch_document || '';
      default:
        return '';
    }
  };

  const formatServiceOverview = (state: InterviewState): string => {
    const answers = state.clarification_answers;
    if (!answers) return '';

    return `# サービス概要

## プロジェクト名
${answers.service_overview || ''}

## 解決したい課題
${answers.problem || ''}

## ターゲットユーザー
${answers.persona || ''}

## 提供ソリューション
${answers.solution || ''}

## 詳細な要求サマリー
${state.user_request || ''}`;
  };

  const formatPersonas = (personas: Persona[]): string => {
    if (!personas.length) return '# ペルソナ\n\nペルソナ情報がありません。';

    return `# ペルソナ

${personas.map((persona, index) => `## ${index + 1}. ${persona.name}

**背景:** ${persona.background}

---
`).join('\n')}`;
  };

  const formatInterviews = (interviews: Interview[]): string => {
    if (!interviews.length) return '# インタビュー結果\n\nインタビュー結果がありません。';

    return `# インタビュー結果

${interviews.map((interview, index) => `## ${index + 1}. ${interview.persona.name}さんへのインタビュー

**質問:** ${interview.question}

**回答:** ${interview.answer}

---
`).join('\n')}`;
  };

  const formatAnalysisReport = (analysis: any): string => {
    if (!analysis) return '# 外部環境分析レポート\n\n外部環境分析レポートがありません。';

    return `# 外部環境分析レポート

## 顧客分析
${analysis.customer_analysis || ''}

## 競合分析
${analysis.competitor_analysis || ''}

## 自社分析
${analysis.company_analysis || ''}

## PEST分析
${analysis.pest_analysis || ''}

## 要約と戦略的提言
${analysis.summary_and_strategy || ''}`;
  };

  const currentTabContent = getTabContent(activeTab);

  return (
    <div className="h-full flex flex-col bg-white min-h-0">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const hasContent = getTabContent(tab.id).trim().length > 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-500 bg-white"
                    : hasContent
                    ? "text-gray-700 border-transparent hover:text-gray-900 hover:border-gray-300"
                    : "text-gray-400 border-transparent cursor-not-allowed"
                )}
                disabled={!hasContent}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  activeTab === tab.id ? "text-blue-600" : hasContent ? "text-gray-500" : "text-gray-300"
                )} />
                {tab.label}
                {hasContent && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Controls */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50 flex-shrink-0">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setEditorMode('rich')}
            className={cn(
              "px-3 py-1.5 text-xs rounded transition-colors font-medium",
              editorMode === 'rich' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Rich Text
          </button>
          <button
            onClick={() => setEditorMode('markdown')}
            className={cn(
              "px-3 py-1.5 text-xs rounded transition-colors font-medium",
              editorMode === 'markdown' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Markdown
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-xs text-gray-500">
              保存済み: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <Button
            onClick={saveToProposals}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1.5"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save className="w-3 h-3" />
              </motion.div>
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span className="ml-1">保存</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {editorMode === 'rich' && (
        <div className="border-b border-gray-200 p-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            {/* Font formatting */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.command}
                  onClick={() => formatText(btn.command)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title={btn.title}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Alignment */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              {alignButtons.map((btn) => (
                <button
                  key={btn.command}
                  onClick={() => formatText(btn.command)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title={btn.title}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
              <button
                onClick={() => insertList(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="箇条書き"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertList(true)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="番号付きリスト"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            {/* Insert */}
            <div className="flex items-center">
              <button
                onClick={() => formatText('createLink', prompt('URL:') || '')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="リンク"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="画像"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="表"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden min-h-0">
        {currentTabContent ? (
          editorMode === 'rich' ? (
            <div className="h-full p-6 overflow-y-auto prose prose-sm max-w-none min-h-0">
              <div dangerouslySetInnerHTML={{ 
                __html: currentTabContent.split('\n').map(line => {
                  if (line.startsWith('# ')) {
                    return `<h1 class="text-2xl font-bold mb-4 text-gray-900">${line.substring(2)}</h1>`;
                  } else if (line.startsWith('## ')) {
                    return `<h2 class="text-xl font-semibold mb-3 text-gray-800 mt-6">${line.substring(3)}</h2>`;
                  } else if (line.startsWith('### ')) {
                    return `<h3 class="text-lg font-medium mb-2 text-gray-700 mt-4">${line.substring(4)}</h3>`;
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return `<p class="font-semibold mb-2">${line.substring(2, line.length - 2)}</p>`;
                  } else if (line.trim() === '---') {
                    return `<hr class="my-6 border-gray-200">`;
                  } else if (line.trim() === '') {
                    return `<br>`;
                  } else {
                    return `<p class="mb-3 text-gray-700 leading-relaxed">${line}</p>`;
                  }
                }).join('')
              }} />
            </div>
          ) : (
            <textarea
              value={currentTabContent}
              readOnly
              className="w-full h-full p-6 font-mono text-sm resize-none border-none focus:outline-none bg-gray-50 min-h-0"
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">データがありません</p>
              <p className="text-sm">このタブのコンテンツはまだ生成されていません。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}