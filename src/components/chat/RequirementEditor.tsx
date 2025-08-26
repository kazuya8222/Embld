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
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '../auth/AuthProvider';

interface RequirementEditorProps {
  chatId: string;
}

type EditorMode = 'rich' | 'markdown';

export function RequirementEditor({ chatId }: RequirementEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('要件定義書');
  const [editorMode, setEditorMode] = useState<EditorMode>('rich');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadExistingProposal();
  }, [chatId]);

  const loadExistingProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('chat_session_id', chatId)
        .single();

      if (data) {
        setContent(data.content || '');
        setTitle(data.title || '要件定義書');
      }
    } catch (error) {
      console.log('No existing proposal found');
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Editor Controls */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
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
        <div className="border-b border-gray-200 p-2">
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
      <div className="flex-1 overflow-hidden">
        {editorMode === 'rich' ? (
          <div
            ref={editorRef}
            contentEditable
            className="h-full p-6 overflow-y-auto focus:outline-none"
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content || `
              <h1>AIエージェントの未来：技術革新と社会変革の展望</h1>
              <p><em>作成日：2024年12月</em></p>
              <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 24px 0; color: #374151;">
                人工知能（AI）エージェントは、21世紀の技術革新における最も重要な要素の一つとして、急速に発展を遂げています。これらの自律的なAIシステムは、人間の指示や環境の変化に応じて独立して行動し、複雑なタスクを実行する能力を持っています。本レポートでは、AIエージェントの現状から将来展望まで、技術的進歩、社会への影響、そして我々が直面する課題について包括的に分析いたします。
              </blockquote>
              <h2>1. 現在のAIエージェントの状況</h2>
              <h3>1.1 技術的現状</h3>
            ` }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 font-mono text-sm resize-none border-none focus:outline-none"
            placeholder="# 要件定義書

## 1. プロジェクト概要

## 2. 機能要件

## 3. 非機能要件"
          />
        )}
      </div>
    </div>
  );
}