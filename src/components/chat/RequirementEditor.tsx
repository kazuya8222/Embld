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
  FileCheck,
  TrendingUp,
  Send,
  CheckCircle,
  Clock,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { InterviewState, Persona, Interview } from '@/lib/types/agent';

interface RequirementEditorProps {
  chatId: string;
  agentState?: InterviewState | null;
  initialActiveTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onSubmissionSuccess?: () => void;
}


type TabType = 'overview' | 'personas' | 'interviews' | 'requirements' | 'analysis' | 'pitch' | 'evaluation';

export function RequirementEditor({ chatId, agentState, initialActiveTab, onTabChange, onSubmissionSuccess }: RequirementEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('要件定義書');
  const [activeTab, setActiveTab] = useState<TabType>(initialActiveTab || 'overview');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
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

  useEffect(() => {
    // Update active tab when initialActiveTab changes
    if (initialActiveTab && initialActiveTab !== activeTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

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
        setSubmissionStatus(data.status || 'draft');
        if (data.submitted_at) {
          setSubmittedAt(new Date(data.submitted_at));
        }
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
      pitch: agentState.pitch_document || '',
      evaluation: formatEvaluationReport(agentState)
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

  const parsePitchDocument = (pitchContent: string) => {
    // Parse the pitch document content
    const sections: any = {
      service_name: '',
      problem_statement: '',
      solution_description: '',
      target_users: '',
      main_features: [],
      business_model: '',
      recruitment_message: ''
    };

    // Extract service name
    const nameMatch = pitchContent.match(/^#\s*🚀\s*プロジェクト企画書:\s*(.+)$/m);
    if (nameMatch) {
      sections.service_name = nameMatch[1].trim();
    }

    // Extract problem statement
    const problemMatch = pitchContent.match(/##\s*😵.*?解決したい課題[\s\S]*?>\s*(.+?)(?=\n\n|##|\z)/);
    if (problemMatch) {
      sections.problem_statement = problemMatch[1].trim();
    }

    // Extract solution description  
    const solutionMatch = pitchContent.match(/##\s*✨.*?解決策[\s\S]*?>\s*(.+?)(?=\n\n|##|\z)/);
    if (solutionMatch) {
      sections.solution_description = solutionMatch[1].trim();
    }

    // Extract target users
    const targetMatch = pitchContent.match(/##\s*🎯\s*ターゲットユーザー[\s\S]*?-\s*\*\*こんな人にピッタリ:\*\*\s*(.+?)(?=\n\n|##|\z)/);
    if (targetMatch) {
      sections.target_users = targetMatch[1].trim();
    }

    // Extract main features
    const featuresMatch = pitchContent.match(/##\s*🛠️.*?主要機能[\s\S]*?\n((?:-\s*\*\*.+?\*\*:.+?\n?)+)/);
    if (featuresMatch) {
      const features = featuresMatch[1].split('\n')
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/-\s*\*\*(.+?)\*\*:\s*(.+)/);
          if (match) {
            return {
              name: match[1].trim(),
              description: match[2].trim()
            };
          }
          return null;
        })
        .filter(Boolean);
      sections.main_features = features;
    }

    // Extract business model
    const businessMatch = pitchContent.match(/##\s*💰.*?ビジネス[\s\S]*?-\s*(.+?)(?=\n\n|##|\z)/);
    if (businessMatch) {
      sections.business_model = businessMatch[1].trim();
    }

    // Extract recruitment message
    const recruitmentMatch = pitchContent.match(/##\s*🤝.*?作りませんか[\s\S]*?-\s*(.+?)(?=\n\n|\z)/);
    if (recruitmentMatch) {
      sections.recruitment_message = recruitmentMatch[1].trim();
    }

    return sections;
  };

  const submitProposal = async () => {
    if (!user) {
      alert('ログインが必要です。');
      return;
    }
    
    if (!agentState || !agentState.pitch_document) {
      alert('企画書が生成されていません。先に企画書を生成してください。');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Parse the pitch document to extract structured data
      const pitchData = parsePitchDocument(agentState.pitch_document);
      
      // Check if proposal already exists
      const { data: existing, error: fetchError } = await supabase
        .from('proposals')
        .select('id')
        .eq('chat_session_id', chatId)
        .maybeSingle();  // Use maybeSingle instead of single to avoid error when no data

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const proposalData = {
        user_id: user.id,
        chat_session_id: chatId,
        service_name: pitchData.service_name || 'サービス名未設定',
        problem_statement: pitchData.problem_statement || '',
        solution_description: pitchData.solution_description || '',
        target_users: pitchData.target_users || '',
        main_features: pitchData.main_features || [],
        business_model: pitchData.business_model || '',
        recruitment_message: pitchData.recruitment_message || '',
        status: 'submitted' as const,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let proposalId: string;
      
      if (existing) {
        // Update existing proposal
        const { data: updateData, error: updateError } = await supabase
          .from('proposals')
          .update(proposalData)
          .eq('id', existing.id)
          .select('id')
          .single();

        if (updateError) {
          throw updateError;
        }
        proposalId = updateData.id;
      } else {
        // Create new proposal
        const { data: insertData, error: insertError } = await supabase
          .from('proposals')
          .insert([proposalData])
          .select('id')
          .single();

        if (insertError) {
          throw insertError;
        }
        proposalId = insertData.id;
      }
      
      setSubmissionStatus('submitted');
      setSubmittedAt(new Date());
      
      // Navigate to the proposal page
      window.location.href = `/proposals/${proposalId}`;
      
    } catch (error: any) {
      let errorMessage = '企画書の提出に失敗しました。';
      if (error?.message) {
        errorMessage += `\n詳細: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
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
    { id: 'evaluation', label: '分割評価', icon: TrendingUp },
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
      case 'evaluation':
        return formatEvaluationReport(agentState);
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

  const formatEvaluationReport = (state: InterviewState): string => {
    const { profitability, feasibility, legal } = state;
    
    if (!profitability && !feasibility && !legal) {
      return '# 分割評価\n\n評価結果がありません。';
    }

    return `# 分割評価

## 収益性評価
${profitability ? `**結果:** ${profitability.is_profitable ? '✅ 収益性が見込まれる' : '❌ 収益性に課題がある'}

**理由:** ${profitability.reason}` : '評価結果がありません。'}

---

## 実現可能性評価
${feasibility ? `**結果:** ${feasibility.is_feasible ? '✅ 実現可能' : '❌ 実現に課題がある'}

**理由:** ${feasibility.reason}` : '評価結果がありません。'}

---

## 法的リスク評価
${legal ? `**結果:** ${legal.is_compliant ? '✅ 法的リスクは低い' : '⚠️ 法的リスクがある'}

**理由:** ${legal.reason}` : '評価結果がありません。'}`;
  };

  // Check if proposal is ready for submission
  const isProposalComplete = (): boolean => {
    if (!agentState) {
      return false;
    }
    
    // Only require pitch document for submission
    // Other documents are optional/for reference
    return !!agentState.pitch_document;
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
                onClick={() => {
                  setActiveTab(tab.id);
                  onTabChange?.(tab.id);
                }}
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

      {/* Submission Bar */}
      {isProposalComplete() && (
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {submissionStatus === 'draft' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  企画書の作成が完了しました。提出の準備が整いました。
                </span>
              </>
            )}
            {submissionStatus === 'submitted' && (
              <>
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  提出済み {submittedAt && `(${submittedAt.toLocaleDateString()})`}
                </span>
              </>
            )}
            {submissionStatus === 'approved' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">承認済み</span>
              </>
            )}
            {submissionStatus === 'rejected' && (
              <>
                <X className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">差し戻し</span>
              </>
            )}
          </div>
          
          {submissionStatus === 'draft' && (
            <Button
              onClick={submitProposal}
              disabled={isSubmitting || !isProposalComplete()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提出中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  企画書を提出
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden min-h-0">
        {currentTabContent ? (
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