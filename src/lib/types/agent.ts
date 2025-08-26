import { z } from 'zod';

// ========== Base Types ==========
export const PersonaSchema = z.object({
  name: z.string(),
  background: z.string()
});

export const InterviewSchema = z.object({
  persona: PersonaSchema,
  question: z.string(),
  answer: z.string()
});

export const EvaluationResultSchema = z.object({
  reason: z.string(),
  is_sufficient: z.boolean(),
  gaps: z.array(z.string()),
  followup_questions: z.array(z.string())
});

export const ExternalEnvironmentAnalysisSchema = z.object({
  customer_analysis: z.string(),
  competitor_analysis: z.string(),
  company_analysis: z.string(),
  pest_analysis: z.string(),
  summary_and_strategy: z.string()
});

export const ProfitabilityAssessmentSchema = z.object({
  is_profitable: z.boolean(),
  reason: z.string()
});

export const FeasibilityAssessmentSchema = z.object({
  is_feasible: z.boolean(),
  reason: z.string()
});

export const LegalAssessmentSchema = z.object({
  is_compliant: z.boolean(),
  reason: z.string()
});

// ========== Question Plan Types ==========
export type QType = "yesno" | "single" | "multi" | "text";

export type Choice = {
  label: string;
  value: string;
};

export type Question = {
  id: string;
  section: number;
  prompt: string;
  type: QType;
  choices?: Choice[];
  placeholder?: string;
  required?: boolean;
  saveKey: string;
  needsModelAssist?: boolean;
};

// ========== Node IDs ==========
export type NodeId =
  | "clarification_interview"
  | "detailed_questions"
  | "summarize_request"
  | "generate_personas"
  | "conduct_interviews"
  | "evaluate_information"
  | "ask_followups"
  | "generate_professional_requirements"
  | "analyze_environment"
  | "assess_profitability"
  | "assess_feasibility"
  | "assess_legal"
  | "assessment_gate"
  | "improve_requirements"
  | "generate_pitch";

// ========== Interview State ==========
export const InterviewStateSchema = z.object({
  initial_problem: z.string(),
  initial_persona: z.string(),
  initial_solution: z.string(),
  clarification_interview_log: z.string().default(""),
  clarification_answers: z.record(z.string()).default({}), // 質問への回答を保存
  current_question_index: z.number().default(0), // 現在の質問インデックス
  detailed_questions: z.array(z.string()).default([]), // 生成された詳細質問
  detailed_answers: z.record(z.string()).default({}), // 詳細質問への回答
  current_detailed_question_index: z.number().default(0), // 詳細質問の現在位置
  user_request: z.string().default(""),
  personas: z.array(PersonaSchema).default([]),
  interviews: z.array(InterviewSchema).default([]),
  professional_requirements_doc: z.string().default(""),
  consultant_analysis_report: ExternalEnvironmentAnalysisSchema.optional(),
  iteration: z.number().default(0),
  is_information_sufficient: z.boolean().default(false),
  evaluation_result: EvaluationResultSchema.optional(),
  followup_round: z.number().default(0),
  pitch_document: z.string().default(""),
  profitability: ProfitabilityAssessmentSchema.optional(),
  feasibility: FeasibilityAssessmentSchema.optional(),
  legal: LegalAssessmentSchema.optional(),
  augment_personas: z.boolean().default(false)
});

// ========== Message Types ==========
export const QuestionMessageSchema = z.object({
  type: z.literal("question"),
  content: z.string(),
  choices: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  placeholder: z.string().optional(),
  node: z.enum([
    "clarification_interview",
    "detailed_questions",
    "summarize_request", 
    "generate_personas",
    "conduct_interviews",
    "evaluate_information",
    "ask_followups",
    "generate_professional_requirements",
    "analyze_environment",
    "assess_profitability",
    "assess_feasibility",
    "assess_legal",
    "assessment_gate",
    "improve_requirements",
    "generate_pitch"
  ]),
  key: z.string(),
  questionId: z.string().optional(),
  currentQuestion: z.number().optional(),
  totalQuestions: z.number().optional()
});

export const ModelPlanSchema = z.object({
  type: z.literal("plan"),
  nextNode: z.enum([
    "clarification_interview",
    "detailed_questions",
    "summarize_request",
    "generate_personas", 
    "conduct_interviews",
    "evaluate_information",
    "ask_followups",
    "generate_professional_requirements",
    "analyze_environment",
    "assess_profitability",
    "assess_feasibility",
    "assess_legal",
    "assessment_gate",
    "improve_requirements",
    "generate_pitch"
  ]),
  statePatch: z.record(z.any()).optional()
});

export const StreamingMessageSchema = z.object({
  type: z.literal("streaming"),
  content: z.string(),
  isComplete: z.boolean(),
  node: z.enum([
    "clarification_interview",
    "detailed_questions",
    "summarize_request",
    "generate_personas",
    "conduct_interviews", 
    "evaluate_information",
    "ask_followups",
    "generate_professional_requirements",
    "analyze_environment",
    "assess_profitability",
    "assess_feasibility",
    "assess_legal",
    "assessment_gate",
    "improve_requirements",
    "generate_pitch"
  ])
});

export const CompletedDocumentSchema = z.object({
  type: z.literal("completed"),
  documentType: z.enum([
    "summary", 
    "personas", 
    "interviews", 
    "requirements", 
    "analysis", 
    "pitch",
    "profitability_assessment",
    "feasibility_assessment",
    "legal_assessment"
  ]),
  title: z.string().optional(),
  content: z.string(),
  node: z.enum([
    "clarification_interview",
    "detailed_questions",
    "summarize_request",
    "generate_personas",
    "conduct_interviews",
    "evaluate_information", 
    "ask_followups",
    "generate_professional_requirements",
    "analyze_environment",
    "assess_profitability",
    "assess_feasibility",
    "assess_legal",
    "assessment_gate",
    "improve_requirements",
    "generate_pitch"
  ])
});

// ========== Type Exports ==========
export type Persona = z.infer<typeof PersonaSchema>;
export type Interview = z.infer<typeof InterviewSchema>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
export type ExternalEnvironmentAnalysis = z.infer<typeof ExternalEnvironmentAnalysisSchema>;
export type ProfitabilityAssessment = z.infer<typeof ProfitabilityAssessmentSchema>;
export type FeasibilityAssessment = z.infer<typeof FeasibilityAssessmentSchema>;
export type LegalAssessment = z.infer<typeof LegalAssessmentSchema>;
export type InterviewState = z.infer<typeof InterviewStateSchema>;
export type QuestionMessage = z.infer<typeof QuestionMessageSchema>;
export type ModelPlan = z.infer<typeof ModelPlanSchema>;
export type StreamingMessage = z.infer<typeof StreamingMessageSchema>;
export type CompletedDocument = z.infer<typeof CompletedDocumentSchema>;

// ========== Agent Response Types ==========
export type AgentResponse = QuestionMessage | ModelPlan | StreamingMessage | CompletedDocument;

// ========== API Types ==========
export interface AgentChatRequest {
  message: string;
  sessionId: string;
  agentType: 'service_builder' | 'code_assistant' | 'business_advisor';
  state?: Partial<InterviewState>;
  currentNode?: NodeId;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AgentChatResponse {
  response: AgentResponse;
  state: InterviewState;
  nextNode?: NodeId;
  isComplete?: boolean;
}