'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  Send,
  Sparkles,
  Code,
  FileText,
  Loader2,
  Menu,
  Share,
  Star,
  HelpCircle,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  FolderOpen,
  ArrowUp,
  CheckCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { Sidebar } from '../common/Sidebar';
import { cn } from '@/lib/utils/cn';
import { RequirementEditor } from './RequirementEditor';
import { 
  AgentResponse, 
  InterviewState,
  InterviewStateSchema, 
  NodeId, 
  QuestionMessage, 
  StreamingMessage, 
  CompletedDocument,
  ModelPlan,
  Choice
} from '@/lib/types/agent';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  agent_type?: string;
  step_info?: any;
  agent_response?: AgentResponse;
  choices?: Choice[];
}

interface ChatSession {
  id: string;
  title: string;
  initial_message?: string;
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  chatId: string;
}

type ViewMode = 'preview' | 'code';
type AgentType = 'service_builder' | 'code_assistant' | 'business_advisor';

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('service_builder');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [isExecutingNode, setIsExecutingNode] = useState(false);
  const [executingNodeName, setExecutingNodeName] = useState<NodeId | null>(null);
  const [isInitialAutoSending, setIsInitialAutoSending] = useState(false);
  const initialMessageProcessed = useRef(false);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmTimeoutId, setConfirmTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [showRequirementEditor, setShowRequirementEditor] = useState(false);
  const [agentState, setAgentState] = useState<InterviewState | null>(null);
  const [currentNode, setCurrentNode] = useState<NodeId>('clarification_interview');
  const [requirementEditorActiveTab, setRequirementEditorActiveTab] = useState<'overview' | 'personas' | 'interviews' | 'requirements' | 'analysis' | 'pitch' | 'evaluation'>('overview');
  
  // Check if all tasks are completed
  const isAllTasksCompleted = (state: InterviewState | null): boolean => {
    if (!state) return false;
    
    return !!(
      state.professional_requirements_doc && 
      state.personas && state.personas.length > 0 &&
      state.interviews && state.interviews.length > 0 &&
      state.consultant_analysis_report &&
      state.pitch_document &&
      (state.profitability || state.feasibility || state.legal)
    );
  };
  const [pendingQuestion, setPendingQuestion] = useState<QuestionMessage | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const agentOptions = [
    { value: 'service_builder', label: 'サービス構築', icon: Sparkles, color: 'text-blue-500' },
    { value: 'code_assistant', label: 'コード生成', icon: Code, color: 'text-green-500' },
    { value: 'business_advisor', label: 'ビジネス', icon: FileText, color: 'text-purple-500' }
  ];

  const getNodeDisplayName = (nodeId: NodeId): string => {
    const nodeNames: Record<NodeId, string> = {
      "clarification_interview": "基本質問を処理",
      "detailed_questions": "詳細質問を処理", 
      "summarize_request": "要求をまとめ",
      "generate_personas": "ペルソナを生成",
      "conduct_interviews": "インタビューを実施",
      "evaluate_information": "情報を評価",
      "ask_followups": "追加質問を生成",
      "generate_professional_requirements": "要求仕様書を生成",
      "analyze_environment": "環境分析を実行",
      "assess_profitability": "収益性を評価",
      "assess_feasibility": "実現可能性を評価",
      "assess_legal": "法的適合性を評価",
      "assessment_gate": "総合評価を実行",
      "improve_requirements": "要求仕様を改善",
      "generate_pitch": "提案資料を生成"
    };
    return nodeNames[nodeId] || nodeId;
  };

  useEffect(() => {
    if (chatId) {
      console.log('Loading chat session:', chatId);
      // Fetch session first to restore agent state, then messages
      fetchSession().then(() => {
        console.log('Session loaded, now loading messages');
        fetchMessages();
      });
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Handle initial message from database - use ref to prevent double execution
    const processInitialMessage = () => {
      // Get initial message from session data
      const initialMessage = session?.initial_message;
      
      console.log('Initial message check:', {
        initialMessage,
        processed: initialMessageProcessed.current,
        messagesLength: messages.length,
        isLoading,
        chatId,
        sessionLoaded: !!session,
        shouldProcess: initialMessage && !initialMessageProcessed.current && messages.length === 0 && !isLoading && chatId
      });
      
      if (initialMessage && !initialMessageProcessed.current && messages.length === 0 && !isLoading && chatId) {
        console.log('Processing initial message (one-time only):', initialMessage);
        initialMessageProcessed.current = true;
        setInitialMessageSent(true);
        setIsInitialAutoSending(true);
        
        // Auto-send the initial message after a short delay (no input bar display)
        console.log('Setting timeout for auto-send');
        
        // Clear any existing timeout
        if (initialTimeoutRef.current) {
          clearTimeout(initialTimeoutRef.current);
        }
        
        initialTimeoutRef.current = setTimeout(() => {
          console.log('Auto-sending initial message:', initialMessage);
          // Send directly without displaying in input bar
          handleInitialMessageSend(initialMessage);
          setIsInitialAutoSending(false);
          initialTimeoutRef.current = null;
          
          // Clear initial_message from database after using it (one-time use)
          const clearInitialMessage = async () => {
            try {
              await supabase
                .from('chat_sessions')
                .update({ initial_message: null })
                .eq('id', chatId);
              console.log('Cleared initial message from database');
            } catch (error) {
              console.log('Error clearing initial message:', error);
            }
          };
          clearInitialMessage();
            
        }, 500); // Reduced delay since we don't need to show in input
        
        console.log('Timeout set with ID:', initialTimeoutRef.current);
      }
    };
    
    // Only process if session is loaded
    if (session) {
      processInitialMessage();
    }
  }, [messages.length, isLoading, chatId, session, supabase]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      setSession(data);
      
      // Restore agent state from session metadata
      if (data?.metadata?.agent_state) {
        console.log('Restoring agent state from session:', data.metadata.agent_state);
        try {
          const restoredState = InterviewStateSchema.parse(data.metadata.agent_state);
          setAgentState(restoredState);
          console.log('Agent state restored successfully');
        } catch (parseError) {
          console.error('Error parsing stored agent state:', parseError);
        }
      }
      
      // Restore current node
      if (data?.metadata?.current_node) {
        setCurrentNode(data.metadata.current_node);
        console.log('Current node restored:', data.metadata.current_node);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for chatId:', chatId);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const fetchedMessages = data || [];
      console.log('Fetched messages:', fetchedMessages.length);
      setMessages(fetchedMessages);
      
      // If we have existing messages, mark initial message as sent to prevent auto-sending
      if (fetchedMessages.length > 0) {
        console.log('Found existing messages, preventing auto-send');
        initialMessageProcessed.current = true;
        setInitialMessageSent(true);
      } else {
        console.log('No existing messages found');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleInitialMessageSend = async (message: string) => {
    console.log('=== handleInitialMessageSend called ===', { 
      message, 
      isLoading, 
      isExecutingNode,
      chatId,
      canProceed: !(!message || isLoading || isExecutingNode)
    });
    
    if (!message || isLoading || isExecutingNode) {
      console.log('handleInitialMessageSend blocked:', { message: !!message, isLoading, isExecutingNode });
      return;
    }

    setIsLoading(true);
    setPendingQuestion(null);

    try {
      // Save user message
      const { data: userMsg, error: userError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatId,
            role: 'user',
            content: message,
            agent_type: selectedAgent
          }
        ])
        .select()
        .single();

      if (userError) throw userError;
      setMessages(prev => [...prev, userMsg]);

      // Update session title if it's the first message
      if (messages.length === 0) {
        const title = message.length > 50 
          ? message.substring(0, 50) + '...' 
          : message;
        
        await supabase
          .from('chat_sessions')
          .update({ 
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);
      }

              // Call Agent API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            sessionId: chatId,
            agentType: selectedAgent,
            state: agentState,
            currentNode: currentNode,
            history: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        console.log('API response received (handleInitialMessageSend):', data);
        
        // Update agent state
        setAgentState(data.state);
        if (data.nextNode) {
          setCurrentNode(data.nextNode);
          console.log('Moving to next node (handleInitialMessageSend):', data.nextNode);
        }

      // Handle different response types
      const agentResponse = data.response;
      
      if (agentResponse.type === 'question') {
        setPendingQuestion(agentResponse as QuestionMessage);
        
        // Save question as assistant message
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: agentResponse.content,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                choices: agentResponse.choices
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, {
          ...assistantMsg,
          agent_response: agentResponse,
          choices: agentResponse.choices
        }]);
        
      } else if (agentResponse.type === 'plan') {
        // Handle ModelPlan - automatically continue to next node
        console.log('Received plan response, continuing to next node:', data.nextNode);
        
        if (data.nextNode && !isExecutingNode) {
          // Automatically execute the next node with debouncing
          setIsExecutingNode(true);
          setTimeout(async () => {
            try {
              await executeNextNode(data.nextNode, data.state);
            } finally {
              setIsExecutingNode(false);
              setExecutingNodeName(null);
            }
          }, 200);
        }
        
      } else if (agentResponse.type === 'streaming') {
        // Handle streaming response
        const streamingResponse = agentResponse as StreamingMessage;
        
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: streamingResponse.content,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                document_type: 'streaming'
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, assistantMsg]);

        // If streaming node, start streaming
        if (['generate_professional_requirements', 'analyze_environment', 'generate_pitch'].includes(data.nextNode)) {
          await handleStreaming(data.nextNode, data.state);
        }
        
      } else if (agentResponse.type === 'completed') {
        // Handle completed document
        const completedResponse = agentResponse as CompletedDocument;
        
        // Generate document title based on type
        const documentTitle = completedResponse.title || getDocumentTitle(completedResponse.documentType);
        
        // Create a button display instead of showing full content
        const buttonContent = `📄 ${documentTitle}が生成されました`;
        
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: buttonContent,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                document_type: completedResponse.documentType,
                document_title: documentTitle,
                full_content: completedResponse.content,
                is_document_button: true
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, assistantMsg]);
        
        // Update and persist agent state
        if (data.state) {
          console.log('Updating agent state from API response');
          setAgentState(data.state);
          
          // Save to session metadata immediately for persistence
          try {
            await supabase
              .from('chat_sessions')
              .update({
                metadata: {
                  agent_state: data.state,
                  current_node: data.nextNode || currentNode,
                  updated_at: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', chatId);
            console.log('Agent state persisted to database');
          } catch (saveError) {
            console.error('Error persisting agent state:', saveError);
          }
        }
        
        // Auto-progress to next node if specified
        if (data.nextNode && !isExecutingNode) {
          setIsExecutingNode(true);
          setTimeout(async () => {
            try {
              await executeNextNode(data.nextNode, data.state);
            } finally {
              setIsExecutingNode(false);
              setExecutingNodeName(null);
            }
          }, 200);
        }
      }

    } catch (error) {
      console.error('Error sending initial message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (messageOverride?: string) => {
    const messageToSend = messageOverride || input.trim();
    if (!messageToSend || isLoading || isExecutingNode) {
      console.log('sendMessage blocked:', { messageToSend, isLoading, isExecutingNode });
      return;
    }

    console.log('=== sendMessage called ===', { messageToSend, isLoading, isExecutingNode, isInitialAutoSending });

    // Only clear input if it's not an override (i.e., user typed message or choice button)
    if (!messageOverride) {
      setInput('');
    }
    setIsLoading(true);
    setPendingQuestion(null);

    try {
      // Save user message
      const { data: userMsg, error: userError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatId,
            role: 'user',
            content: messageToSend,
            agent_type: selectedAgent
          }
        ])
        .select()
        .single();

      if (userError) throw userError;
      setMessages(prev => [...prev, userMsg]);

      // Update session title if it's the first message
      if (messages.length === 0) {
        const title = messageToSend.length > 50 
          ? messageToSend.substring(0, 50) + '...' 
          : messageToSend;
        
        await supabase
          .from('chat_sessions')
          .update({ 
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);
      }

              // Call Agent API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageToSend,
            sessionId: chatId,
            agentType: selectedAgent,
            state: agentState,
            currentNode: currentNode,
            history: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        console.log('API response received (sendMessage):', data);
        
        // Update agent state
        console.log('Updating agent state from API response:', {
          old_question_index: agentState?.current_question_index,
          new_question_index: data.state.current_question_index,
          old_answers: agentState?.clarification_answers,
          new_answers: data.state.clarification_answers
        });
        setAgentState(data.state);
        if (data.nextNode) {
          setCurrentNode(data.nextNode);
          console.log('Moving to next node (sendMessage):', data.nextNode);
        }
        
        // Persist agent state after every update
        try {
          await supabase
            .from('chat_sessions')
            .update({
              metadata: {
                agent_state: data.state,
                current_node: data.nextNode || currentNode,
                updated_at: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', chatId);
          console.log('Agent state saved after sendMessage');
        } catch (saveError) {
          console.error('Error saving agent state after sendMessage:', saveError);
        }

      // Handle different response types
      const agentResponse = data.response;
      
      if (agentResponse.type === 'question') {
        setPendingQuestion(agentResponse as QuestionMessage);
        
        // Save question as assistant message
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: agentResponse.content,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                choices: agentResponse.choices
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, {
          ...assistantMsg,
          agent_response: agentResponse,
          choices: agentResponse.choices
        }]);
        
      } else if (agentResponse.type === 'plan') {
        // Handle ModelPlan - automatically continue to next node
        console.log('Received plan response, continuing to next node:', data.nextNode);
        
        if (data.nextNode && !isExecutingNode) {
          // Automatically execute the next node with debouncing
          setIsExecutingNode(true);
          setTimeout(async () => {
            try {
              await executeNextNode(data.nextNode, data.state);
            } finally {
              setIsExecutingNode(false);
              setExecutingNodeName(null);
            }
          }, 200);
        }
        
      } else if (agentResponse.type === 'streaming') {
        // Handle streaming response
        const streamingResponse = agentResponse as StreamingMessage;
        
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: streamingResponse.content,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                document_type: 'streaming'
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, assistantMsg]);

        // If streaming node, start streaming
        if (['generate_professional_requirements', 'analyze_environment', 'generate_pitch'].includes(data.nextNode)) {
          await handleStreaming(data.nextNode, data.state);
        }
        
      } else if (agentResponse.type === 'completed') {
        // Handle completed document
        const completedResponse = agentResponse as CompletedDocument;
        
        // Generate document title based on type
        const documentTitle = completedResponse.title || getDocumentTitle(completedResponse.documentType);
        
        // Create a button display instead of showing full content
        const buttonContent = `📄 ${documentTitle}が生成されました`;
        
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: buttonContent,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                document_type: completedResponse.documentType,
                document_title: documentTitle,
                full_content: completedResponse.content,
                is_document_button: true
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, assistantMsg]);
        
        // Update and persist agent state
        if (data.state) {
          console.log('Updating agent state from API response');
          setAgentState(data.state);
          
          // Save to session metadata immediately for persistence
          try {
            await supabase
              .from('chat_sessions')
              .update({
                metadata: {
                  agent_state: data.state,
                  current_node: data.nextNode || currentNode,
                  updated_at: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', chatId);
            console.log('Agent state persisted to database');
          } catch (saveError) {
            console.error('Error persisting agent state:', saveError);
          }
        }
        
        // Auto-progress to next node if specified
        if (data.nextNode && !isExecutingNode) {
          setIsExecutingNode(true);
          setTimeout(async () => {
            try {
              await executeNextNode(data.nextNode, data.state);
            } finally {
              setIsExecutingNode(false);
              setExecutingNodeName(null);
            }
          }, 200);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isExecutingNode, chatId, selectedAgent, agentState, currentNode, messages]);

  const executeNextNode = useCallback(async (nextNode: NodeId, state: InterviewState) => {
    // Prevent multiple simultaneous executions
    if (isExecutingNode || isLoading) {
      console.log('Already executing, skipping executeNextNode');
      return;
    }
    
    try {
      console.log('Executing next node:', nextNode);
      setIsExecutingNode(true);
      setExecutingNodeName(nextNode);
      
              // Call Agent API with no user message to trigger next step
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: '', // No user message for automatic progression
            sessionId: chatId,
            agentType: selectedAgent,
            state: state,
            currentNode: nextNode,
            history: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        });

        if (!response.ok) throw new Error('Next node execution failed');

        const data = await response.json();
        console.log('API response received (executeNextNode):', data);
        
        // Update agent state
        setAgentState(data.state);
        if (data.nextNode) {
          setCurrentNode(data.nextNode);
          console.log('Moving to next node (executeNextNode):', data.nextNode);
        }
        
        // Persist agent state immediately
        try {
          await supabase
            .from('chat_sessions')
            .update({
              metadata: {
                agent_state: data.state,
                current_node: data.nextNode || nextNode,
                updated_at: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', chatId);
          console.log('Agent state saved in executeNextNode');
        } catch (saveError) {
          console.error('Error saving agent state in executeNextNode:', saveError);
        }

      // Handle the response from next node
      const agentResponse = data.response;
      
      if (agentResponse.type === 'question') {
        setPendingQuestion(agentResponse as QuestionMessage);
        
        // Save question as assistant message
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: agentResponse.content,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                choices: agentResponse.choices
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, {
          ...assistantMsg,
          agent_response: agentResponse,
          choices: agentResponse.choices
        }]);
        
      } else if (agentResponse.type === 'plan') {
        const planResponse = agentResponse as ModelPlan;
        // Allow progression to different nodes, but prevent same-node loops
        if (data.nextNode && data.nextNode !== nextNode && !isExecutingNode) {
          console.log('Plan response - auto-executing different node:', data.nextNode);
          setIsExecutingNode(true);
          setExecutingNodeName(data.nextNode);
          setTimeout(async () => {
            try {
              await executeNextNode(data.nextNode, data.state);
            } finally {
              setIsExecutingNode(false);
              setExecutingNodeName(null);
            }
          }, 200);
        } else {
          console.log('Plan response - preventing same-node or already executing loop');
        }
      } else if (agentResponse.type === 'completed') {
        // Handle completed document
        const completedResponse = agentResponse as CompletedDocument;
        
        // Generate document title based on type
        const documentTitle = completedResponse.title || getDocumentTitle(completedResponse.documentType);
        
        // Create a button display instead of showing full content
        const buttonContent = `📄 ${documentTitle}が生成されました`;
        
        const { data: assistantMsg, error: assistantError } = await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: chatId,
              role: 'assistant',
              content: buttonContent,
              agent_type: selectedAgent,
              metadata: { 
                agent_response: agentResponse,
                document_type: completedResponse.documentType,
                document_title: documentTitle,
                full_content: completedResponse.content,
                is_document_button: true
              }
            }
          ])
          .select()
          .single();

        if (assistantError) throw assistantError;
        setMessages(prev => [...prev, assistantMsg]);
        
        // Update and persist agent state
        if (data.state) {
          console.log('Updating agent state from API response');
          setAgentState(data.state);
          
          // Save to session metadata immediately for persistence
          try {
            await supabase
              .from('chat_sessions')
              .update({
                metadata: {
                  agent_state: data.state,
                  current_node: data.nextNode || currentNode,
                  updated_at: new Date().toISOString()
                },
                updated_at: new Date().toISOString()
              })
              .eq('id', chatId);
            console.log('Agent state persisted to database');
          } catch (saveError) {
            console.error('Error persisting agent state:', saveError);
          }
        }
        
        // Auto-progress to next node if specified
        if (data.nextNode && !isExecutingNode) {
          setIsExecutingNode(true);
          setExecutingNodeName(data.nextNode);
          setTimeout(async () => {
            try {
              await executeNextNode(data.nextNode, data.state);
            } finally {
              setIsExecutingNode(false);
              setExecutingNodeName(null);
            }
          }, 200);
        }
      }
      // Handle other response types as needed...
      
    } catch (error) {
      console.error('Error executing next node:', error);
    } finally {
      setIsExecutingNode(false);
      setExecutingNodeName(null);
    }
  }, [isExecutingNode, isLoading, chatId, selectedAgent, messages]);

  const handleStreaming = async (node: NodeId, state: InterviewState) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: chatId,
          state: state,
          node: node
        }),
      });

      if (!response.ok) throw new Error('Streaming failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedContent = '';
      setStreamingContent('');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'streaming') {
                accumulatedContent += data.content;
                setStreamingContent(accumulatedContent);
                
                // Update the last message with streaming content
                setMessages(prev => {
                  const updated = [...prev];
                  if (updated.length > 0) {
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...lastMessage,
                        content: accumulatedContent
                      };
                    }
                  }
                  return updated;
                });

                if (data.isComplete) {
                  // Save final content to database
                  await supabase
                    .from('chat_messages')
                    .update({ content: accumulatedContent })
                    .eq('session_id', chatId)
                    .eq('role', 'assistant')
                    .order('created_at', { ascending: false })
                    .limit(1);
                  
                  setStreamingContent('');
                  break;
                }
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      if (!isConfirmed) {
        // 1回目のEnter：確定
        setIsConfirmed(true);
        
        // 既存のタイムアウトをクリア
        if (confirmTimeoutId) {
          clearTimeout(confirmTimeoutId);
        }
        
        // 3秒後にリセット
        const id = setTimeout(() => {
          setIsConfirmed(false);
        }, 3000);
        setConfirmTimeoutId(id);
      } else {
        // 2回目のEnter：送信
        sendMessage();
        setIsConfirmed(false);
        if (confirmTimeoutId) {
          clearTimeout(confirmTimeoutId);
          setConfirmTimeoutId(null);
        }
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      // Ctrl+Enter for new line (default textarea behavior)
      // Let the default behavior happen
    }
  };

  const getDocumentTitle = (documentType: string): string => {
    switch (documentType) {
      case 'summary': return 'サービス概要';
      case 'personas': return 'ペルソナ';
      case 'interviews': return 'インタビュー結果';
      case 'requirements': return '統合要件定義書';
      case 'analysis': return '外部環境分析レポート';
      case 'pitch': return 'プロジェクト企画書';
      case 'profitability_assessment': return '収益性評価';
      case 'feasibility_assessment': return '実現可能性評価';
      case 'legal_assessment': return '法的リスク評価';
      default: return 'ドキュメント';
    }
  };

  const openDocumentInEditor = (documentType: string, content: string) => {
    // Map document type to tab
    const documentTypeToTab: Record<string, 'overview' | 'personas' | 'interviews' | 'requirements' | 'analysis' | 'pitch' | 'evaluation'> = {
      'summary': 'overview',
      'personas': 'personas', 
      'interviews': 'interviews',
      'requirements': 'requirements',
      'analysis': 'analysis',
      'pitch': 'pitch',
      'evaluation': 'evaluation'
    };
    
    const targetTab = documentTypeToTab[documentType] || 'overview';
    console.log('Opening document editor for:', documentType, '-> tab:', targetTab);
    
    setRequirementEditorActiveTab(targetTab);
    setShowRequirementEditor(true);
  };

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered;

  return (
    <div className="h-screen bg-[#1a1a1a] relative flex flex-col overflow-hidden">
      {/* Top Menu Bar */}
      <div className="px-6 py-3 flex items-center justify-between bg-[#1a1a1a] flex-shrink-0">
        {/* Left side - Menu and Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleMenuToggle}
            onMouseEnter={() => handleMenuHover(true)}
            className="p-1.5 hover:bg-[#3a3a3a] rounded transition-colors"
          >
            <Menu className="w-4 h-4 text-[#e0e0e0]" />
          </button>
        </div>

        {/* Center - Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-base font-medium text-[#e0e0e0]">
            {session?.title || 'AIエージェントの未来'}
          </h1>
        </div>

        {/* Right side - Empty space for balance */}
        <div className="w-16"></div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 h-screen"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Interface */}
        <div className={cn(
          "flex flex-col bg-[#1a1a1a] transition-all duration-300 relative min-h-0",
          showRequirementEditor ? "w-1/2" : "w-full"
        )}>

          {/* Messages Area - Centered with bottom padding for fixed input */}
          <div className="flex-1 overflow-y-auto pb-32 min-h-0">
            <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-2xl rounded-lg relative group",
                      message.role === 'user'
                        ? "bg-[#2a2a2a] text-[#e0e0e0] px-4 py-3"
                        : "px-0 py-0 bg-transparent w-full"
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-[#e0e0e0] whitespace-pre-wrap">
                        {/* Check if this is a document button */}
                        {message.metadata?.is_document_button ? (
                          <Button
                            onClick={() => {
                              const documentType = message.metadata?.document_type as string;
                              const content = message.metadata?.full_content as string;
                              if (documentType && content) {
                                openDocumentInEditor(documentType, content);
                              }
                            }}
                            variant="outline"
                            className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] hover:border-[#4a4a4a] text-[#e0e0e0] px-4 py-6 flex items-center gap-3 w-full max-w-md justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <FolderOpen className="w-5 h-5 text-[#0066cc]" />
                              <div className="text-left">
                                <div className="font-medium">{message.metadata?.document_title || 'ドキュメント'}</div>
                                <div className="text-xs text-[#a0a0a0] mt-1">クリックして詳細を表示</div>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[#a0a0a0] group-hover:text-[#e0e0e0] transition-colors" />
                          </Button>
                        ) : (
                          message.content
                        )}
                        {/* Show streaming indicator if content is being streamed */}
                        {streamingContent && message.id === messages[messages.length - 1]?.id && (
                          <div className="flex items-center gap-2 mt-2 text-[#a0a0a0]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-xs">生成中...</span>
                          </div>
                        )}
                        {/* Show choice buttons if available */}
                        {message.choices && message.choices.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {message.choices.map((choice, index) => (
                              <Button
                                key={index}
                                onClick={() => {
                                  console.log('Choice button clicked:', choice.value, 'Message ID:', message.id);
                                  if (!isLoading && !isExecutingNode) {
                                    sendMessage(choice.value);
                                  } else {
                                    console.log('Button disabled - already processing');
                                  }
                                }}
                                variant="outline"
                                size="lg"
                                className="bg-[#3a3a3a] border-[#4a4a4a] text-[#e0e0e0] hover:bg-[#4a4a4a] hover:border-[#5a5a5a] px-6 py-3 text-base font-medium"
                                disabled={isLoading || isExecutingNode}
                              >
                                {choice.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Show progress indicator for clarification interview */}
                        {message.agent_response?.type === 'question' && 
                         message.agent_response?.currentQuestion && 
                         message.agent_response?.totalQuestions && (
                          <div className="mt-4 p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                            <div className="flex items-center justify-between text-sm text-[#a0a0a0] mb-2">
                              <span>進捗</span>
                              <span>{message.agent_response.currentQuestion - 1} / {message.agent_response.totalQuestions}</span>
                            </div>
                            <div className="w-full bg-[#3a3a3a] rounded-full h-2">
                              <div 
                                className="bg-[#0066cc] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((message.agent_response.currentQuestion - 1) / message.agent_response.totalQuestions) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 text-[#a0a0a0]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>回答を生成中...</span>
                  </div>
                </motion.div>
              )}
              
              {isExecutingNode && executingNodeName && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 text-[#a0a0a0]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{getNodeDisplayName(executingNodeName)}中...</span>
                  </div>
                </motion.div>
              )}

              {/* Completion Message */}
              {!isLoading && !isExecutingNode && isAllTasksCompleted(agentState) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="flex gap-3 max-w-4xl">
                    <div className="w-8 h-8 bg-[#0066cc] rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      AI
                    </div>
                    <div className="min-w-0">
                      <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3">
                        <div className="whitespace-pre-wrap text-[#e0e0e0]">要件定義書の作成が完了しました。{'\n'}詳細を確認し、保存してください。</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input Area at Bottom - With Background */}
          <div className="fixed bottom-0 left-0 z-30 bg-[#1a1a1a] pb-6" 
               style={{ 
                 width: showRequirementEditor ? '50%' : '100%'
               }}>
            <div className="px-6">
              <div className="max-w-4xl mx-auto">
                {/* Input Field */}
                <div className={`bg-[#2a2a2a] backdrop-blur-sm rounded-2xl border ${isConfirmed ? 'border-blue-500' : 'border-[#3a3a3a]'} transition-colors duration-200`}>
                
                {/* Input with send button */}
                <div className="flex items-end px-4 pt-3 pb-1">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      // テキストが変更されたら確定状態をリセット
                      if (isConfirmed) {
                        setIsConfirmed(false);
                        if (confirmTimeoutId) {
                          clearTimeout(confirmTimeoutId);
                          setConfirmTimeoutId(null);
                        }
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={isConfirmed ? "もう一度Enterキーで送信" : "ここにメッセージを入力..."}
                    className="flex-1 min-h-[60px] text-lg bg-transparent border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-[#e0e0e0] placeholder:text-[#a0a0a0] pr-4"
                    disabled={isLoading}
                  />
                  
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        console.log('Send button clicked');
                        sendMessage();
                        setIsConfirmed(false);
                        if (confirmTimeoutId) {
                          clearTimeout(confirmTimeoutId);
                          setConfirmTimeoutId(null);
                        }
                      }}
                      disabled={!input.trim() || isLoading || isExecutingNode}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-black p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Requirements Editor */}
        <AnimatePresence>
          {showRequirementEditor && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="border-l border-[#3a3a3a] overflow-hidden min-h-0"
            >
              <div className="relative h-full flex flex-col min-h-0">
                {/* Document Header */}
                <div className="bg-[#2a2a2a] px-4 py-3 border-b border-[#3a3a3a] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#e0e0e0]" />
                    <span className="text-sm font-medium text-[#e0e0e0]">要件定義書</span>
                  </div>
                  <button
                    onClick={() => setShowRequirementEditor(false)}
                    className="p-1 hover:bg-[#3a3a3a] rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-[#a0a0a0]" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden min-h-0">
                  <RequirementEditor 
                    chatId={chatId} 
                    agentState={agentState} 
                    initialActiveTab={requirementEditorActiveTab}
                    onTabChange={setRequirementEditorActiveTab}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}