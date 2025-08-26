import OpenAI from 'openai';
import { 
  InterviewState, 
  NodeId, 
  AgentResponse, 
  QuestionMessage, 
  ModelPlan,
  StreamingMessage,
  CompletedDocument,
  Persona,
  Interview,
  EvaluationResult,
  ExternalEnvironmentAnalysis,
  ProfitabilityAssessment,
  FeasibilityAssessment,
  LegalAssessment
} from '@/lib/types/agent';

export class AgentWorkflow {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async executeNode(
    node: NodeId, 
    state: InterviewState, 
    userResponse?: string
  ): Promise<{ response: AgentResponse; nextState: InterviewState; nextNode?: NodeId }> {
    
    console.log(`=== Executing Node: ${node} ===`);
    console.log('User response:', userResponse);
    console.log('Current state:', {
      initial_problem: state.initial_problem,
      clarification_log_length: state.clarification_interview_log.length,
      user_request_length: state.user_request.length,
      current_question_index: state.current_question_index
    });

    switch (node) {
      case "clarification_interview":
        return this.handleClarificationInterview(state, userResponse);
      
      case "detailed_questions":
        return this.handleDetailedQuestions(state, userResponse);
      
      case "summarize_request":
        return this.handleSummarizeRequest(state);
      
      case "generate_personas":
        return this.handleGeneratePersonas(state, userResponse);
      
      case "conduct_interviews":
        return this.handleConductInterviews(state, userResponse);
      
      case "evaluate_information":
        return this.handleEvaluateInformation(state);
      
      case "ask_followups":
        return this.handleAskFollowups(state, userResponse);
      
      case "generate_professional_requirements":
        return this.handleGenerateProfessionalRequirements(state);
      
      case "analyze_environment":
        return this.handleAnalyzeEnvironment(state);
      
      case "assess_profitability":
        return this.handleAssessProfitability(state);
      
      case "assess_feasibility":
        return this.handleAssessFeasibility(state);
      
      case "assess_legal":
        return this.handleAssessLegal(state);
      
      case "assessment_gate":
        return this.handleAssessmentGate(state);
      
      case "improve_requirements":
        return this.handleImproveRequirements(state);
      
      case "generate_pitch":
        return this.handleGeneratePitch(state);
      
      default:
        throw new Error(`Unknown node: ${node}`);
    }
  }

  private async handleClarificationInterview(
    state: InterviewState, 
    userResponse?: string
  ): Promise<{
    response: AgentResponse; 
    nextState: InterviewState; 
    nextNode?: NodeId;
  }> {
    console.log('=== handleClarificationInterview ===');
    console.log('Has user response:', !!userResponse);
    console.log('Current question index:', state.current_question_index);
    console.log('Service overview:', state.clarification_answers['service_overview']);
    console.log('Current state answers:', {
      service_overview: state.clarification_answers['service_overview'],
      problem: state.clarification_answers['problem'],
      persona: state.clarification_answers['persona'],
      solution: state.clarification_answers['solution']
    });

    // Define the questions (after service overview)
    const questions = [
      {
        id: 'problem',
        prompt: '解決したい課題は何ですか？',
        placeholder: '例: 歌を歌っているとき、一人だと寂しい',
        key: 'problem'
      },
      {
        id: 'persona',
        prompt: 'この課題を持つターゲットユーザー（ペルソナ）は誰ですか？',
        placeholder: '例: カラオケが好きな20代の社会人',
        key: 'persona'
      },
      {
        id: 'solution',
        prompt: 'どのような解決策を想定していますか？',
        placeholder: '例: AIが自動でハモってくれるアプリ',
        key: 'solution'
      }
    ];

    // Process user response
    if (userResponse && userResponse.trim()) {
      // First response is the service overview
      if (!state.clarification_answers['service_overview']) {
        console.log('Saving service overview and showing first question');
        
        const updatedAnswers = {
          ...state.clarification_answers,
          service_overview: userResponse
        };
        
        const newState: InterviewState = {
          ...state,
          clarification_answers: updatedAnswers,
          current_question_index: 0  // Start with first question
        };
        
        // Show the first question (problem)
        const response: QuestionMessage = {
          type: "question",
          content: questions[0].prompt,
          placeholder: questions[0].placeholder,
          node: "clarification_interview",
          key: questions[0].key,
          currentQuestion: 1,
          totalQuestions: 3
        };
        
        return {
          response,
          nextState: newState
        };
      }
      
      // Process answers to the 3 questions
      console.log('Processing answer for question index:', state.current_question_index);
      
      const currentQuestionKey = questions[state.current_question_index]?.key;
      
      if (currentQuestionKey) {
        // Save the answer
        const updatedAnswers = {
          ...state.clarification_answers,
          [currentQuestionKey]: userResponse
        };

        const nextIndex = state.current_question_index + 1;
        
        // Check if all 3 questions are completed
        if (nextIndex >= 3) {
          console.log('All 3 questions completed, moving to summarize_request');
          
          // Format the collected information
          const clarificationLog = `## 収集した情報\n\n` +
            `### サービス概要\n${updatedAnswers['service_overview']}\n\n` +
            `### 想定課題\n${updatedAnswers['problem']}\n\n` +
            `### ペルソナ\n${updatedAnswers['persona']}\n\n` +
            `### 想定解決策\n${updatedAnswers['solution']}`;
          
          const finalState: InterviewState = {
            ...state,
            initial_problem: updatedAnswers['problem'] || state.initial_problem,
            initial_persona: updatedAnswers['persona'] || state.initial_persona,
            initial_solution: updatedAnswers['solution'] || state.initial_solution,
            clarification_answers: updatedAnswers,
            clarification_interview_log: clarificationLog,
            current_question_index: nextIndex
          };

          const response: ModelPlan = {
            type: "plan",
            nextNode: "detailed_questions",
            statePatch: { 
              initial_problem: finalState.initial_problem,
              initial_persona: finalState.initial_persona,
              initial_solution: finalState.initial_solution,
              clarification_answers: updatedAnswers,
              clarification_interview_log: clarificationLog,
              current_question_index: nextIndex
            }
          };

          return {
            response,
            nextState: finalState,
            nextNode: "detailed_questions"
          };
        }

        // Move to next question
        const nextQuestion = questions[nextIndex];
        const newState: InterviewState = {
          ...state,
          clarification_answers: updatedAnswers,
          current_question_index: nextIndex
        };

        const response: QuestionMessage = {
          type: "question",
          content: nextQuestion.prompt,
          placeholder: nextQuestion.placeholder,
          node: "clarification_interview",
          key: nextQuestion.key,
          currentQuestion: nextIndex + 1,
          totalQuestions: 3
        };

        console.log('Moving to question:', nextQuestion.id);

        return {
          response,
          nextState: newState
        };
      }
    }

    // Show current question if no response yet (only after service overview is collected)
    if (!userResponse || !userResponse.trim()) {
      // If we don't have service overview yet, wait for it (don't show questions yet)
      if (!state.clarification_answers['service_overview']) {
        console.log('Waiting for service overview - not showing questions yet');
        // Return a plan to stay in the same node and wait for user input
        const response: QuestionMessage = {
          type: "question",
          content: "サービスの概要を教えてください",
          placeholder: "例: 歌を歌うとAIが自動でハモってくれるアプリ",
          node: "clarification_interview",
          key: "service_overview",
          currentQuestion: 0,
          totalQuestions: 4
        };
        
        return {
          response,
          nextState: state
        };
      }
      
      // Show current question if service overview is already collected
      const currentIndex = state.current_question_index;
      if (currentIndex < 3) {
        const currentQuestion = questions[currentIndex];
        
        const response: QuestionMessage = {
          type: "question",
          content: currentQuestion.prompt,
          placeholder: currentQuestion.placeholder,
          node: "clarification_interview",
          key: currentQuestion.key,
          currentQuestion: currentIndex + 1,
          totalQuestions: 3
        };

        console.log('Showing question:', currentQuestion.id, 'at index:', currentIndex);

        return {
          response,
          nextState: state
        };
      }
    }

    // All questions completed
    console.log('All questions already completed, moving to next step');
    const response: ModelPlan = {
      type: "plan",
      nextNode: "summarize_request"
    };

    return {
      response,
      nextState: state,
      nextNode: "summarize_request"
    };
  }

  private async handleDetailedQuestions(
    state: InterviewState, 
    userResponse?: string
  ): Promise<{
    response: AgentResponse; 
    nextState: InterviewState; 
    nextNode?: NodeId;
  }> {
    console.log('=== handleDetailedQuestions ===');
    console.log('Has user response:', !!userResponse);
    console.log('Current detailed question index:', state.current_detailed_question_index);
    console.log('Total detailed questions:', state.detailed_questions.length);

    // Generate detailed questions if not generated yet
    if (state.detailed_questions.length === 0) {
      console.log('Generating detailed questions based on collected inputs');
      
      const problem = state.clarification_answers['problem'] || state.initial_problem;
      const persona = state.clarification_answers['persona'] || state.initial_persona;
      const solution = state.clarification_answers['solution'] || state.initial_solution;
      
      const detailedQuestions = await this.generateDetailedQuestions(problem, persona, solution);
      
      const newState: InterviewState = {
        ...state,
        detailed_questions: detailedQuestions,
        current_detailed_question_index: 0
      };
      
      // Show first detailed question
      const firstQuestion = detailedQuestions[0];
      const response: QuestionMessage = {
        type: "question",
        content: firstQuestion,
        choices: [
          { label: "はい", value: "はい" },
          { label: "いいえ", value: "いいえ" },
          { label: "わからない", value: "わからない" }
        ],
        node: "detailed_questions",
        key: "detailed_0",
        currentQuestion: 1,
        totalQuestions: detailedQuestions.length
      };
      
      return {
        response,
        nextState: newState
      };
    }
    
    // Process user response to detailed question
    if (userResponse && userResponse.trim()) {
      console.log('Processing detailed question answer:', state.current_detailed_question_index);
      
      const updatedAnswers = {
        ...state.detailed_answers,
        [`detailed_${state.current_detailed_question_index}`]: userResponse
      };
      
      const nextIndex = state.current_detailed_question_index + 1;
      
      // Check if all detailed questions are completed
      if (nextIndex >= state.detailed_questions.length) {
        console.log('All detailed questions completed, moving to summarize_request');
        
        // Format detailed question log
        const detailedLog = this.formatDetailedAnswersAsLog(state.detailed_questions, updatedAnswers);
        
        const finalState: InterviewState = {
          ...state,
          detailed_answers: updatedAnswers,
          clarification_interview_log: state.clarification_interview_log + '\n\n' + detailedLog,
          current_detailed_question_index: nextIndex
        };
        
        const response: ModelPlan = {
          type: "plan",
          nextNode: "summarize_request",
          statePatch: {
            detailed_answers: updatedAnswers,
            clarification_interview_log: finalState.clarification_interview_log,
            current_detailed_question_index: nextIndex
          }
        };
        
        return {
          response,
          nextState: finalState,
          nextNode: "summarize_request"
        };
      }
      
      // Move to next detailed question
      const nextQuestion = state.detailed_questions[nextIndex];
      const newState: InterviewState = {
        ...state,
        detailed_answers: updatedAnswers,
        current_detailed_question_index: nextIndex
      };
      
      const response: QuestionMessage = {
        type: "question",
        content: nextQuestion,
        choices: [
          { label: "はい", value: "はい" },
          { label: "いいえ", value: "いいえ" },
          { label: "わからない", value: "わからない" }
        ],
        node: "detailed_questions",
        key: `detailed_${nextIndex}`,
        currentQuestion: nextIndex + 1,
        totalQuestions: state.detailed_questions.length
      };
      
      return {
        response,
        nextState: newState
      };
    }
    
    // Show current detailed question if no response
    const currentIndex = state.current_detailed_question_index;
    if (currentIndex < state.detailed_questions.length) {
      const currentQuestion = state.detailed_questions[currentIndex];
      
      const response: QuestionMessage = {
        type: "question",
        content: currentQuestion,
        choices: [
          { label: "はい", value: "はい" },
          { label: "いいえ", value: "いいえ" },
          { label: "わからない", value: "わからない" }
        ],
        node: "detailed_questions",
        key: `detailed_${currentIndex}`,
        currentQuestion: currentIndex + 1,
        totalQuestions: state.detailed_questions.length
      };
      
      return {
        response,
        nextState: state
      };
    }
    
    // All questions completed, move to next step
    const response: ModelPlan = {
      type: "plan",
      nextNode: "summarize_request"
    };
    
    return {
      response,
      nextState: state,
      nextNode: "summarize_request"
    };
  }

  private async handleSummarizeRequest(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleSummarizeRequest ===');
    console.log('Input data:', {
      initial_problem: state.initial_problem,
      initial_persona: state.initial_persona,
      initial_solution: state.initial_solution,
      clarification_answers: state.clarification_answers
    });

    // Generate summary from the 3 collected inputs
    const summary = await this.generateRequestSummary(
      state.initial_problem,
      state.initial_persona,
      state.initial_solution,
      state.clarification_interview_log
    );

    console.log('Generated summary:', summary);

    const newState: InterviewState = {
      ...state,
      user_request: summary
    };

    // Display the summary to the user as a completed document
    const response: CompletedDocument = {
      type: "completed",
      documentType: "summary",
      title: "サービス概要",
      content: summary,
      node: "summarize_request"
    };

    console.log('Returning completed summary document');

    return {
      response,
      nextState: newState,
      nextNode: "generate_personas"
    };
  }

  private async handleGeneratePersonas(
    state: InterviewState, 
    userResponse?: string
  ): Promise<{
    response: AgentResponse;
    nextState: InterviewState; 
    nextNode?: NodeId;
  }> {
    console.log('=== handleGeneratePersonas ===');
    console.log('User response:', userResponse);
    
    // If user confirmed personas, move to interviews
    if (userResponse && userResponse.includes("はい、この設定で進めてください")) {
      console.log('User confirmed personas, moving to conduct_interviews');
      
      const response: ModelPlan = {
        type: "plan",
        nextNode: "conduct_interviews"
      };

      return {
        response,
        nextState: state,
        nextNode: "conduct_interviews"
      };
    }
    
    // Generate personas if not already generated
    if (!state.personas || state.personas.length === 0) {
      try {
        const personas = await this.generatePersonas(state.user_request);
        console.log('Generated personas:', personas.length);
        
        if (personas.length === 0) {
          console.error('No personas generated, returning error');
          // Return error state if no personas were generated
          const response: QuestionMessage = {
            type: "question",
            content: "ペルソナの生成に失敗しました。申し訳ございません。もう一度お試しいただくか、手動でペルソナを設定していただけますか？",
            choices: [
              { label: "再試行する", value: "再試行する" },
              { label: "手動で設定する", value: "手動で設定する" }
            ],
            node: "generate_personas",
            key: "personas_error"
          };

          return {
            response,
            nextState: state
          };
        }
        
        const newState: InterviewState = {
          ...state,
          personas,
          iteration: 0,
          is_information_sufficient: false
        };

        // Format personas for display as document
        const personasSummary = personas.map((persona, index) => 
          `## ${index + 1}. ${persona.name}\n\n**背景:** ${persona.background}\n`
        ).join('\n');
        
        // Return as completed document
        const response: CompletedDocument = {
          type: "completed",
          documentType: "personas",
          title: "ペルソナ",
          content: personasSummary,
          node: "generate_personas"
        };

        return {
          response,
          nextState: newState,
          nextNode: "conduct_interviews"
        };
      } catch (error) {
        console.error('Error in generatePersonas:', error);
        // Return error response
        const response: QuestionMessage = {
          type: "question",
          content: "システムエラーが発生しました。ペルソナの生成でエラーが発生しています。しばらくお待ちいただいてから再試行してください。",
          choices: [
            { label: "再試行する", value: "再試行する" }
          ],
          node: "generate_personas",
          key: "system_error"
        };

        return {
          response,
          nextState: state
        };
      }
    }

    // If personas already exist, return as document and auto-progress
    const personasSummary = state.personas.map((persona, index) => 
      `## ${index + 1}. ${persona.name}\n\n**背景:** ${persona.background}\n`
    ).join('\n');
    
    const response: CompletedDocument = {
      type: "completed",
      documentType: "personas",
      title: "ペルソナ",
      content: personasSummary,
      node: "generate_personas"
    };

    return {
      response,
      nextState: state,
      nextNode: "conduct_interviews"
    };
  }

  private async handleConductInterviews(
    state: InterviewState, 
    userResponse?: string
  ): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleConductInterviews ===');
    console.log('User response:', userResponse);
    
    // If user confirmed interviews, move to evaluate information
    if (userResponse && userResponse.includes("はい、この情報で要件定義を進めてください")) {
      console.log('User confirmed interviews, moving to evaluate_information');
      
      const response: ModelPlan = {
        type: "plan",
        nextNode: "evaluate_information"
      };

      return {
        response,
        nextState: state,
        nextNode: "evaluate_information"
      };
    }

    // If interviews already exist, return as document
    if (state.interviews && state.interviews.length > 0) {
      const interviewsSummary = state.interviews.map((interview, index) => 
        `## ${index + 1}. ${interview.persona.name}さんへのインタビュー\n\n**質問:** ${interview.question}\n\n**回答:** ${interview.answer}\n`
      ).join('\n');

      const response: CompletedDocument = {
        type: "completed",
        documentType: "interviews",
        title: "インタビュー結果",
        content: interviewsSummary,
        node: "conduct_interviews"
      };

      return {
        response,
        nextState: state,
        nextNode: "evaluate_information"
      };
    }

    // Conduct interviews if not already done
    const interviews = await this.conductInterviews(state.user_request, state.personas);
    console.log('Conducted interviews:', interviews.length);
    
    const newState: InterviewState = {
      ...state,
      interviews
    };

    // Format interviews for display as document
    const interviewsSummary = interviews.map((interview, index) => 
      `## ${index + 1}. ${interview.persona.name}さんへのインタビュー\n\n**質問:** ${interview.question}\n\n**回答:** ${interview.answer}\n`
    ).join('\n');

    const response: CompletedDocument = {
      type: "completed",
      documentType: "interviews",
      title: "インタビュー結果",
      content: interviewsSummary,
      node: "conduct_interviews"
    };

    return {
      response,
      nextState: newState,
      nextNode: "evaluate_information"
    };
  }

  private async handleEvaluateInformation(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    const evaluation = await this.evaluateInformation(state.user_request, state.interviews);
    
    const newState: InterviewState = {
      ...state,
      is_information_sufficient: evaluation.is_sufficient,
      iteration: state.iteration + 1,
      evaluation_result: evaluation
    };

    let nextNode: NodeId;
    if (evaluation.is_sufficient) {
      nextNode = "generate_professional_requirements";
    } else if (state.followup_round < 2) {
      nextNode = "ask_followups";
    } else {
      nextNode = "generate_professional_requirements"; // 自動補完して前進
    }

    const response: ModelPlan = {
      type: "plan",
      nextNode,
      statePatch: { 
        is_information_sufficient: evaluation.is_sufficient,
        iteration: state.iteration + 1,
        evaluation_result: evaluation 
      }
    };

    return {
      response,
      nextState: newState,
      nextNode
    };
  }

  private async handleAskFollowups(
    state: InterviewState, 
    userResponse?: string
  ): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleAskFollowups ===');
    console.log('Has user response:', !!userResponse);
    console.log('Followup round:', state.followup_round);
    console.log('Has evaluation result:', !!state.evaluation_result);

    if (!state.evaluation_result) {
      console.log('No evaluation result, moving to professional requirements');
      const response: ModelPlan = {
        type: "plan",
        nextNode: "generate_professional_requirements"
      };

      return {
        response,
        nextState: state,
        nextNode: "generate_professional_requirements"
      };
    }

    // If we have a user response, append it to the log
    let updatedLog = state.clarification_interview_log;
    if (userResponse) {
      const header = state.followup_round === 0 
        ? "## 追加入力（1回目・自由記述）" 
        : "## 追加入力（2回目・はい/いいえ）";
      updatedLog += `\n\n${header}\n${userResponse}`;
    }

    // If this is the second round or no questions, move forward with auto-fill
    if (state.followup_round >= 2 || !state.evaluation_result.followup_questions.length) {
      console.log('Max followup rounds reached or no questions, auto-filling and moving forward');
      
      if (state.evaluation_result.gaps.length > 0) {
        const autoFill = await this.generateAssumptionBackfill(
          state.user_request,
          state.interviews,
          state.evaluation_result.gaps
        );
        updatedLog += "\n\n## 自動補完（AI仮設定）\n" + autoFill;
      }

      const newState: InterviewState = {
        ...state,
        clarification_interview_log: updatedLog,
        followup_round: state.followup_round + 1,
        is_information_sufficient: true // Force to move forward
      };

      const response: ModelPlan = {
        type: "plan",
        nextNode: "generate_professional_requirements",
        statePatch: { 
          clarification_interview_log: updatedLog,
          followup_round: newState.followup_round,
          is_information_sufficient: true
        }
      };

      return {
        response,
        nextState: newState,
        nextNode: "generate_professional_requirements"
      };
    }

    const newState: InterviewState = {
      ...state,
      clarification_interview_log: updatedLog,
      followup_round: state.followup_round + 1
    };

    // If we have follow-up questions and no user response yet, ask them
    if (!userResponse && state.evaluation_result.followup_questions.length > 0) {
      console.log('Asking followup questions');
      
      const mode = state.followup_round === 0 ? "自由記述" : "はい/いいえ";
      const questions = state.followup_round === 0 
        ? state.evaluation_result.followup_questions
        : await this.convertToYesNoQuestions(state.evaluation_result.followup_questions);

      const response: QuestionMessage = {
        type: "question",
        content: `以下の点について追加でお聞かせください（${mode}形式）:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
        node: "ask_followups",
        key: "followup_response"
      };

      return {
        response,
        nextState: newState
      };
    }

    // Continue to next step after collecting response
    console.log('Continuing after followup response');
    
    const response: ModelPlan = {
      type: "plan",
      nextNode: "generate_professional_requirements",
      statePatch: { 
        clarification_interview_log: updatedLog,
        followup_round: newState.followup_round
      }
    };

    return {
      response,
      nextState: newState,
      nextNode: "generate_professional_requirements"
    };
  }

  private async handleGenerateProfessionalRequirements(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleGenerateProfessionalRequirements ===');
    const requirements = await this.generateProfessionalRequirements(
      state.user_request,
      state.interviews
    );

    console.log('Generated professional requirements:', requirements.length, 'characters');

    const newState: InterviewState = {
      ...state,
      professional_requirements_doc: requirements
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "requirements",
      title: "統合要件定義書",
      content: requirements,
      node: "generate_professional_requirements"
    };

    console.log('Returning completed requirements document');

    return {
      response,
      nextState: newState,
      nextNode: "analyze_environment"
    };
  }

  private async handleAnalyzeEnvironment(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleAnalyzeEnvironment ===');
    const analysis = await this.analyzeExternalEnvironment(state.professional_requirements_doc);

    console.log('Generated environment analysis');

    const newState: InterviewState = {
      ...state,
      consultant_analysis_report: analysis
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "analysis",
      title: "外部環境分析レポート",
      content: this.formatAnalysisForDisplay(analysis),
      node: "analyze_environment"
    };

    console.log('Returning completed environment analysis document');

    return {
      response,
      nextState: newState,
      nextNode: "assess_profitability"
    };
  }

  private async handleAssessProfitability(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    if (!state.consultant_analysis_report) {
      throw new Error("No analysis report found");
    }

    const assessment = await this.assessProfitability(
      state.professional_requirements_doc,
      state.consultant_analysis_report
    );

    const newState: InterviewState = {
      ...state,
      profitability: assessment
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "profitability_assessment",
      title: "収益性評価",
      content: this.formatProfitabilityForDisplay(assessment),
      node: "assess_profitability"
    };

    return {
      response,
      nextState: newState,
      nextNode: "assess_feasibility"
    };
  }

  private async handleAssessFeasibility(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    if (!state.consultant_analysis_report) {
      throw new Error("No analysis report found");
    }

    const assessment = await this.assessFeasibility(
      state.professional_requirements_doc,
      state.consultant_analysis_report
    );

    const newState: InterviewState = {
      ...state,
      feasibility: assessment
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "feasibility_assessment",
      title: "実現可能性評価",
      content: this.formatFeasibilityForDisplay(assessment),
      node: "assess_feasibility"
    };

    return {
      response,
      nextState: newState,
      nextNode: "assess_legal"
    };
  }

  private async handleAssessLegal(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    if (!state.consultant_analysis_report) {
      throw new Error("No analysis report found");
    }

    const assessment = await this.assessLegal(
      state.professional_requirements_doc,
      state.consultant_analysis_report
    );

    const newState: InterviewState = {
      ...state,
      legal: assessment
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "legal_assessment",
      title: "法的リスク評価",
      content: this.formatLegalForDisplay(assessment),
      node: "assess_legal"
    };

    return {
      response,
      nextState: newState,
      nextNode: "assessment_gate"
    };
  }

  private async handleAssessmentGate(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleAssessmentGate ===');
    console.log('Profitability:', state.profitability);
    console.log('Feasibility:', state.feasibility);
    console.log('Legal:', state.legal);
    
    const profitabilityPassed = state.profitability?.is_profitable ?? false;
    const feasibilityPassed = state.feasibility?.is_feasible ?? false;
    const legalPassed = state.legal?.is_compliant ?? false;
    
    console.log('Assessment results:', {
      profitabilityPassed,
      feasibilityPassed,
      legalPassed
    });
    
    const allPassed = profitabilityPassed && feasibilityPassed && legalPassed;
    console.log('All assessments passed:', allPassed);
    
    const nextNode: NodeId = allPassed ? "generate_pitch" : "improve_requirements";
    console.log('Next node will be:', nextNode);

    const response: ModelPlan = {
      type: "plan",
      nextNode
    };

    return {
      response,
      nextState: state,
      nextNode
    };
  }

  private async handleImproveRequirements(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
    nextNode?: NodeId;
  }> {
    console.log('=== handleImproveRequirements ===');
    if (!state.consultant_analysis_report) {
      throw new Error("No analysis report found");
    }

    const badReasons: string[] = [];
    if (state.profitability && !state.profitability.is_profitable) {
      badReasons.push(`[収益性NG] ${state.profitability.reason}`);
    }
    if (state.feasibility && !state.feasibility.is_feasible) {
      badReasons.push(`[実現性NG] ${state.feasibility.reason}`);
    }
    if (state.legal && !state.legal.is_compliant) {
      badReasons.push(`[法務NG] ${state.legal.reason}`);
    }

    console.log('Bad reasons found:', badReasons.length);
    console.log('Starting requirements improvement...');

    const improvedRequirements = await this.improveRequirements(
      state.professional_requirements_doc,
      state.consultant_analysis_report,
      badReasons
    );

    console.log('Improved requirements length:', improvedRequirements.length);
    console.log('Generating new summary...');

    const newSummary = await this.generateSummaryFromRequirements(improvedRequirements);

    console.log('New summary length:', newSummary.length);

    const newState: InterviewState = {
      ...state,
      professional_requirements_doc: improvedRequirements,
      user_request: newSummary,
      augment_personas: true
      // Keep existing interviews for final pitch generation
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "requirements",
      title: "改善された要件定義書",
      content: improvedRequirements,
      node: "improve_requirements"
    };

    console.log('Returning improved requirements document');
    return {
      response,
      nextState: newState,
      nextNode: "generate_pitch" // Skip to final pitch after improvement
    };
  }

  private async handleGeneratePitch(state: InterviewState): Promise<{
    response: AgentResponse;
    nextState: InterviewState;
  }> {
    console.log('=== handleGeneratePitch ===');
    console.log('User request length:', state.user_request.length);
    console.log('Interviews count:', state.interviews.length);
    
    const pitch = await this.generatePitch(state.user_request, state.interviews);
    console.log('Generated pitch length:', pitch.length);
    console.log('Pitch preview:', pitch.substring(0, 200));

    const newState: InterviewState = {
      ...state,
      pitch_document: pitch
    };

    const response: CompletedDocument = {
      type: "completed",
      documentType: "pitch",
      title: "プロジェクト企画書",
      content: pitch,
      node: "generate_pitch"
    };

    console.log('Returning completed pitch document');
    return {
      response,
      nextState: newState
    };
  }

  // ========== LLM Helper Methods ==========
  
  private async generateClarificationQuestions(
    problem: string, 
    persona: string, 
    solution: string
  ): Promise<string> {
    // まずAIの理解を2文で要約
    const summaryCompletion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '与えられた課題/ペルソナ/解決策を2文で日本語要約。専門用語は避ける。'
        },
        {
          role: 'user',
          content: `課題:${problem}\nペルソナ:${persona}\n解決策:${solution}\n2文で自然に要約:`
        }
      ],
      temperature: 0.7,
    });

    const summary = summaryCompletion.choices[0]?.message?.content?.trim() || '要約に失敗しました。';

    // 最初の質問を生成（AIの理解確認）
    return `AIの理解確認：
${summary}

この理解は正しいですか？`;
  }

  private async generateRequestSummary(
    problem: string,
    persona: string,
    solution: string,
    interviewLog: string
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀なプロジェクトマネージャーです。初期入力と質疑応答ログを読み解き、開発チームが参照するためのプロジェクトサマリーを1段落で簡潔に作成してください。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `## 元情報
- **課題:** ${problem}
- **ターゲットペルソナ:** ${persona}
- **解決策:** ${solution}

## ヒアリングログ
${interviewLog}

## プロジェクトサマリー:`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'エラーが発生しました。';
  }

  private async generatePersonas(userRequest: string): Promise<Persona[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたはユーザーインタビュー用のペルソナ生成の専門家です。プロジェクトサマリーに基づき、適合する候補ペルソナを5名作成してください。人物属性の重複は避けること。出力は必ず日本語のみで記述し、日本名を用いること。JSONフォーマットで返してください。'
        },
        {
          role: 'user',
          content: `プロジェクトサマリー: ${userRequest}

以下のフォーマットで5名のペルソナを返してください：
{
  "personas": [
    {
      "name": "田中太郎",
      "background": "30代前半のエンジニア。副業でアプリ開発を行っている。"
    }
  ]
}`
        }
      ],
      temperature: 0.8,
    });

    try {
      const content = completion.choices[0]?.message?.content || '{"personas": []}';
      console.log('Raw OpenAI response for personas:', content);
      
      // Try to extract JSON from response if it contains other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const result = JSON.parse(jsonString);
      console.log('Parsed personas result:', result);
      return result.personas || [];
    } catch (error) {
      console.error('Error parsing personas JSON:', error);
      console.error('Raw content was:', completion.choices[0]?.message?.content);
      return [];
    }
  }

  private async conductInterviews(userRequest: string, personas: Persona[]): Promise<Interview[]> {
    const interviews: Interview[] = [];
    
    for (const persona of personas) {
      // Generate 3 questions per persona
      const questions = await this.generateInterviewQuestions(userRequest, persona);
      
      for (const question of questions) {
        const answer = await this.generateInterviewAnswer(persona, question);
        interviews.push({
          persona,
          question,
          answer
        });
      }
    }
    
    return interviews;
  }

  private async generateInterviewQuestions(userRequest: string, persona: Persona): Promise<string[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたはUXリサーチの質問設計の専門家です。各ペルソナの文脈から、真意を引き出す具体的な質問を3つ作成してください。回答に時間がかからない粒度、かつ合意形成に役立つものに限定。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `プロジェクトサマリー: ${userRequest}

対象ペルソナ: ${persona.name} - ${persona.background}

箇条書き3問で返してください。`
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    return response.split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);
  }

  private async generateInterviewAnswer(persona: Persona, question: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは以下のペルソナとして回答します。一人称で自然な日本語、2〜3文、具体例を交えること。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `ペルソナ: ${persona.name} - ${persona.background}
質問: ${question}
回答:`
        }
      ],
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || '回答できませんでした。';
  }

  private async evaluateInformation(userRequest: string, interviews: Interview[]): Promise<EvaluationResult> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは包括的な要件文書を作成するための情報の十分性を評価する専門家です。不足がある場合は、何が足りないかと、それを埋めるための追加入力質問を具体的かつ実行可能な形で作成してください。ただし個人開発前提につき、軽微な不足はAIの仮設定で補完可能と判断し、致命的不足のみを不十分とする。出力は必ず日本語のみで記述すること。JSONフォーマットで返してください。'
        },
        {
          role: 'user',
          content: `プロジェクトサマリー: ${userRequest}

インタビュー結果:
${interviews.map(i => `ペルソナ: ${i.persona.name}\n質問: ${i.question}\n回答: ${i.answer}\n`).join('')}

以下のフォーマットで評価結果を返してください：
{
  "reason": "判断理由",
  "is_sufficient": true/false,
  "gaps": ["不足項目1", "不足項目2"],
  "followup_questions": ["追加質問1", "追加質問2"]
}`
        }
      ],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(this.cleanJSONFromMarkdown(completion.choices[0]?.message?.content || '{}'));
      return {
        reason: result.reason || '',
        is_sufficient: result.is_sufficient || false,
        gaps: result.gaps || [],
        followup_questions: result.followup_questions || []
      };
    } catch {
      return {
        reason: '評価に失敗しました',
        is_sufficient: false,
        gaps: [],
        followup_questions: []
      };
    }
  }

  private async convertToYesNoQuestions(questions: string[]): Promise<string[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは質問設計の専門家です。与えられた自由記述のフォローアップ質問群を、ユーザーが「はい／いいえ」で答えられる形式に短文化してください。各質問は1文・日本語・肯定がデフォルト仮説になるように書き換える。'
        },
        {
          role: 'user',
          content: `自由記述の質問群:
${questions.map(q => `- ${q}`).join('\n')}

変換後: 箇条書きで出力。`
        }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '';
    return response.split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  private async generateAssumptionBackfill(
    userRequest: string,
    interviews: Interview[],
    gaps: string[]
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは個人開発のPMです。以下のプロジェクトサマリー/インタビュー/不足項目に基づき、不足を合理的な仮設定で自動補完します。各補完は「決定値（1行）／根拠（1行）／再確認方法（1行）」で短く。日本語で、保守的かつ実装可能な現実解を優先。'
        },
        {
          role: 'user',
          content: `## プロジェクトサマリー
${userRequest}

## インタビューメモ
${interviews.map(i => `- ${i.persona.name}: ${i.answer}`).join('\n')}

## 不足項目
${gaps.map(g => `- ${g}`).join('\n')}

## 出力
- 項目名: 決定値 / 根拠 / 再確認方法（各1行）を箇条書きで。`
        }
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || '自動補完に失敗しました。';
  }

  private async generateProfessionalRequirements(userRequest: string, interviews: Interview[]): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは、個人開発者が単独で着手・運用できるレベルの統合要件定義書（Lean＋Tech）を作成する、経験豊富なプロダクトマネージャー兼システムアナリストです。ビジネス側（Lean BRD）と開発側（Tech Spec）を1つのドキュメントに統合し、空欄を作らず仮説で埋め、実行手順に落とせる粒度で日本語のみで記述してください。'
        },
        {
          role: 'user',
          content: `プロジェクトサマリー: ${userRequest}

インタビュー詳細:
${interviews.map(i => `ペルソナ: ${i.persona.name}\n質問: ${i.question}\n回答: ${i.answer}\n`).join('')}

以下のフォーマットで統合要件定義書を作成してください：

# 📝 統合要件定義書（個人開発向け：Lean＋Tech）

## A. ビジネス（Lean BRD）
### A-1. プロジェクトカード
### A-2. 課題と解く理由（Top3）
### A-3. 主要ユーザーとジョブ
### A-4. 価値提案と差別化
### A-5. 収益モデルと価格（試算付き）
### A-6. 獲得チャネルと最初の10人
### A-7. 成功指標（North Star & KPI）
### A-8. スコープと優先順位（MVP前提）
### A-9. リスク・前提・法務
### A-10. コスト見積とランレート（概算）

## B. 開発（Tech Spec）
### B-1. MVPユーザーストーリー（3〜5件）
### B-2. 画面と主要フロー
### B-3. データモデル（簡易ER）
### B-4. API / 外部連携
### B-5. 非機能要件（個人開発現実解）
### B-6. 運用・サポート
### B-7. 開発ロードマップ（12週目安）
### B-8. 用語集（曖昧語の定義）`
        }
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    return completion.choices[0]?.message?.content || '要件定義書の生成に失敗しました。';
  }

  private async analyzeExternalEnvironment(requirements: string): Promise<ExternalEnvironmentAnalysis> {
    try {
      console.log('=== Starting analyzeExternalEnvironment ===');
      console.log('Requirements length:', requirements.length);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたは外資系戦略コンサルのシニア。個人開発の実行可否判断に足る精度で外部環境を分析する。3C/PESTに加え、JTBD・市場規模推定・ポーターの5フォース・規制/規約マップ・GTM・ユニットエコノミクス・技術実現性・差別化/モート・主要リスク＆対策・シナリオを含め、不足情報は明示的な仮定で補完し、数値はレンジと算出式を示す。出力は日本語、Markdownで簡潔に。JSONフォーマットで返してください。'
          },
          {
            role: 'user',
            content: `統合要件定義書: ${requirements}

以下のフォーマットで外部環境分析を返してください：
{
  "customer_analysis": "市場・顧客分析の内容",
  "competitor_analysis": "競合分析の内容", 
  "company_analysis": "自社分析の内容",
  "pest_analysis": "PEST分析の内容",
  "summary_and_strategy": "要約と戦略的提言の内容"
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });
      
      console.log('OpenAI API call successful');
      const content = completion.choices[0]?.message?.content;
      console.log('OpenAI response content length:', content?.length || 0);
      console.log('OpenAI response preview:', content?.substring(0, 200) || 'No content');
      
      try {
        // Remove markdown code blocks if present
        const cleanContent = this.cleanJSONFromMarkdown(content || '{}');
        console.log('Cleaned content:', cleanContent.substring(0, 200));
        const result = JSON.parse(cleanContent);
        console.log('JSON parsing successful');
        console.log('Parsed result structure:', {
          customer_analysis_type: typeof result.customer_analysis,
          competitor_analysis_type: typeof result.competitor_analysis,
          company_analysis_type: typeof result.company_analysis,
          pest_analysis_type: typeof result.pest_analysis,
          summary_and_strategy_type: typeof result.summary_and_strategy
        });
        
        // Ensure all fields are strings, converting objects to JSON strings if necessary
        const analysis = {
          customer_analysis: this.ensureString(result.customer_analysis),
          competitor_analysis: this.ensureString(result.competitor_analysis),
          company_analysis: this.ensureString(result.company_analysis),
          pest_analysis: this.ensureString(result.pest_analysis),
          summary_and_strategy: this.ensureString(result.summary_and_strategy)
        };
        console.log('Final analysis object types:', {
          customer_analysis_type: typeof analysis.customer_analysis,
          competitor_analysis_type: typeof analysis.competitor_analysis,
          company_analysis_type: typeof analysis.company_analysis,
          pest_analysis_type: typeof analysis.pest_analysis,
          summary_and_strategy_type: typeof analysis.summary_and_strategy
        });
        console.log('Final analysis object:', analysis);
        
        return analysis;
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Raw content:', content);
        return {
          customer_analysis: '分析に失敗しました（JSON解析エラー）',
          competitor_analysis: '分析に失敗しました（JSON解析エラー）', 
          company_analysis: '分析に失敗しました（JSON解析エラー）',
          pest_analysis: '分析に失敗しました（JSON解析エラー）',
          summary_and_strategy: '分析に失敗しました（JSON解析エラー）'
        };
      }
    } catch (apiError) {
      console.error('OpenAI API call failed:', apiError);
      return {
        customer_analysis: '分析に失敗しました（API呼び出しエラー）',
        competitor_analysis: '分析に失敗しました（API呼び出しエラー）', 
        company_analysis: '分析に失敗しました（API呼び出しエラー）',
        pest_analysis: '分析に失敗しました（API呼び出しエラー）',
        summary_and_strategy: '分析に失敗しました（API呼び出しエラー）'
      };
    }
  }

  private async assessProfitability(
    requirements: string,
    analysis: ExternalEnvironmentAnalysis
  ): Promise<ProfitabilityAssessment> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは収益性の監査官。与えられた要件定義書と外部環境分析から、個人開発が継続的に黒字化できる見込みがあるかを判定する。価格戦略、ARPU、CAC、粗利、回収期間、チャーン、チャネルの現実性を短く吟味。出力は必ず日本語のみで記述すること。JSONフォーマットで返してください。'
        },
        {
          role: 'user',
          content: `要件定義書: ${requirements}

外部環境分析:
- 顧客: ${analysis.customer_analysis}
- 競合: ${analysis.competitor_analysis}
- 自社: ${analysis.company_analysis}
- PEST: ${analysis.pest_analysis}
- 要約: ${analysis.summary_and_strategy}

以下のフォーマットで収益性判定を返してください：
{
  "is_profitable": true/false,
  "reason": "判定理由"
}`
        }
      ],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(this.cleanJSONFromMarkdown(completion.choices[0]?.message?.content || '{}'));
      return {
        is_profitable: result.is_profitable || false,
        reason: result.reason || '判定に失敗しました'
      };
    } catch {
      return {
        is_profitable: false,
        reason: '判定に失敗しました'
      };
    }
  }

  private async assessFeasibility(
    requirements: string,
    analysis: ExternalEnvironmentAnalysis
  ): Promise<FeasibilityAssessment> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは実現可能性の監査官。与えられた要件定義書と外部環境分析から、個人が負債なく現実的な工数・コスト・技術難易度で実装・運用できるかを判定する。MVPの範囲、スキル前提、推論コスト/遅延、運用負荷、依存外部APIの制約などを簡潔に評価。出力は必ず日本語のみで記述すること。JSONフォーマットで返してください。'
        },
        {
          role: 'user',
          content: `要件定義書: ${requirements}

外部環境分析:
- 顧客: ${analysis.customer_analysis}
- 競合: ${analysis.competitor_analysis}
- 自社: ${analysis.company_analysis}
- PEST: ${analysis.pest_analysis}
- 要約: ${analysis.summary_and_strategy}

以下のフォーマットで実現性判定を返してください：
{
  "is_feasible": true/false,
  "reason": "判定理由"
}`
        }
      ],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(this.cleanJSONFromMarkdown(completion.choices[0]?.message?.content || '{}'));
      return {
        is_feasible: result.is_feasible || false,
        reason: result.reason || '判定に失敗しました'
      };
    } catch {
      return {
        is_feasible: false,
        reason: '判定に失敗しました'
      };
    }
  }

  private async assessLegal(
    requirements: string,
    analysis: ExternalEnvironmentAnalysis
  ): Promise<LegalAssessment> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは法務・コンプライアンス監査官。与えられた要件定義書と外部環境分析から、著作権・商標・プラットフォーム規約・個人情報/プライバシー・表示義務・年齢制限などの観点でプロダクトが適合しているかを判定する。重大違反の恐れがあればFalse。出力は必ず日本語のみで記述すること。JSONフォーマットで返してください。'
        },
        {
          role: 'user',
          content: `要件定義書: ${requirements}

外部環境分析:
- 顧客: ${analysis.customer_analysis}
- 競合: ${analysis.competitor_analysis}
- 自社: ${analysis.company_analysis}
- PEST: ${analysis.pest_analysis}
- 要約: ${analysis.summary_and_strategy}

以下のフォーマットで法務判定を返してください：
{
  "is_compliant": true/false,
  "reason": "判定理由"
}`
        }
      ],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(this.cleanJSONFromMarkdown(completion.choices[0]?.message?.content || '{}'));
      return {
        is_compliant: result.is_compliant || false,
        reason: result.reason || '判定に失敗しました'
      };
    } catch {
      return {
        is_compliant: false,
        reason: '判定に失敗しました'
      };
    }
  }

  private async improveRequirements(
    requirements: string,
    analysis: ExternalEnvironmentAnalysis,
    badReasons: string[]
  ): Promise<string> {
    console.log('=== improveRequirements ===');
    console.log('Requirements length:', requirements.length);
    console.log('Bad reasons:', badReasons);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたはシニアPMです。以下の材料（要件定義書、外部環境、評価のNG理由）を受け、個人開発で現実的に勝てる形へ要件定義書を改訂します。改訂方針：MVPの絞り込み・差別化の明確化・収益性の改善・実現性の向上・法務の適合のいずれか。元の良さは保持しつつ、危険な仮定は明確に変更。出力は必ず日本語のみで記述すること。Markdownで完結な改訂版を返してください。'
        },
        {
          role: 'user',
          content: `## 旧 要件定義書
${requirements}

## 外部環境の要点
- 顧客: ${analysis.customer_analysis}
- 競合: ${analysis.competitor_analysis}
- 自社: ${analysis.company_analysis}
- PEST: ${analysis.pest_analysis}
- 要約: ${analysis.summary_and_strategy}

## 評価NG理由
${badReasons.join('\n')}

## 出力: 改訂版の要件定義書（Markdown）`
        }
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const improvedContent = completion.choices[0]?.message?.content || '改訂に失敗しました。';
    console.log('Improved requirements length:', improvedContent.length);
    return improvedContent;
  }

  private async generateSummaryFromRequirements(requirements: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは編集者です。与えられた要件定義書から、開発チーム向けに1段落の要約を作成します。トーンは中立・簡潔。固有名の羅列を避け、目的・主要なユーザー価値・MVPスコープを明示する。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `要件定義書（抜粋可）:
${requirements}

---
1段落サマリー:`
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || 'サマリー生成に失敗しました。';
  }

  private async generateSummaryFromAnswers(answers: Record<string, string>): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀なプロジェクトマネージャーです。収集された回答を基に、開発チームが参照するためのプロジェクトサマリーを1段落で簡潔に作成してください。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `## 収集された回答
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## プロジェクトサマリー:`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'エラーが発生しました。';
  }

  private formatAnswersAsLog(answers: Record<string, string>): string {
    const sections = [
      { title: "初期問題", key: "initial_problem" },
      { title: "AI理解確認", key: "alignment.summary.agree" },
      { title: "理解の差分", key: "alignment.summary.diff" },
      { title: "主要ゴール", key: "goal.primary" },
      { title: "成功の合図", key: "goal.signal" },
      { title: "スコープ In", key: "scope.in" },
      { title: "スコープ Out", key: "scope.out" },
      { title: "優先順位", key: "priority.quality_speed" },
      { title: "完成の定義", key: "definition.done" },
      { title: "制約 Must", key: "constraints.must" },
      { title: "制約 Must-not", key: "constraints.must_not" },
      { title: "入力", key: "io.input" },
      { title: "出力", key: "io.output" },
      { title: "ユーザーと文脈", key: "user.context" },
      { title: "曖昧語", key: "terms.user_terms" },
      { title: "懸念・リスク", key: "risks.items" }
    ];

    let log = "## 📋 要件定義インタビュー結果\n\n";
    
    for (const section of sections) {
      const value = answers[section.key];
      if (value && value.trim()) {
        log += `### ${section.title}\n${value}\n\n`;
      }
    }

    return log;
  }

  private async generateDetailedQuestions(problem: string, persona: string, solution: string): Promise<string[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは初期入力（課題・ペルソナ・解決策）の解釈と後続アウトプットの齟齬を最小化するための『方向性アライメント質問票』を作る専門家です。特定の業界・媒体・UI・プロダクト名に依存しない汎用の質問にすること。入力（課題/ペルソナ/解決策）に含まれる用語から曖昧または広範な語を抽出し一般化して定義づけを求める。回答は短時間で可能なよう選択中心＋最小限の自由記入、必要なら『わからない』を用意する。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `【前提（ユーザーの初期入力）】
- 課題: ${problem}
- ペルソナ: ${persona}
- 解決策の仮説: ${solution}

以下の9つの質問を生成してください。それぞれ簡潔で明確な質問にし、「はい/いいえ/わからない」で回答できるような形式にしてください：

1. AIの理解確認に関する質問（理解が正しいか）
2. 主要ゴールに関する質問（価値検証/獲得/効率化/満足度/収益のうちどれが最重要か）
3. スコープInに関する質問（何を含めるか）
4. スコープOutに関する質問（何を含めないか）
5. 優先順位に関する質問（品質 vs 速度）
6. 完成の定義に関する質問（どうなれば完成か）
7. 制約に関する質問（必須条件や禁止事項）
8. 入出力に関する質問（何を入力して何を出力するか）
9. リスクに関する質問（懸念点や注意すべき点）

各質問を1行で、番号なしで出力してください。`
        }
      ],
      temperature: 0.7,
    });

    const questionsText = completion.choices[0]?.message?.content || '';
    const questions = questionsText.split('\n').filter(q => q.trim().length > 0);
    
    console.log('Generated detailed questions:', questions);
    return questions.slice(0, 9); // 最大9つに制限
  }

  private formatDetailedAnswersAsLog(questions: string[], answers: Record<string, string>): string {
    let log = "## 📋 詳細質問と回答\n\n";
    
    questions.forEach((question, index) => {
      const answer = answers[`detailed_${index}`] || '未回答';
      log += `### 質問 ${index + 1}\n${question}\n**回答**: ${answer}\n\n`;
    });
    
    return log;
  }

  private async generatePitch(userRequest: string, interviews: Interview[]): Promise<string> {
    console.log('=== generatePitch ===');
    console.log('User request:', userRequest.substring(0, 100));
    console.log('Interviews count:', interviews.length);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたは、提示された情報を基に、大学生向けの魅力的なプロジェクト企画書（ピッチ資料）を作成する学生起業家です。専門用語を避け、読者が共感しワクワクする文章を作成してください。出力は必ず日本語のみで記述すること。'
        },
        {
          role: 'user',
          content: `プロジェクトサマリー: ${userRequest}

インタビュー詳細:
${interviews.map(i => `ペルソナ「${i.persona.name}」の意見: ${i.answer}\n`).join('')}

以下のフォーマットで魅力的なプロジェクト企画書を作成してください：

# 🚀 プロジェクト企画書: [ここにキャッチーなアプリ名を考案]

## 😵「こんなことで困ってない？」 - 解決したい課題
> [学生向けの言葉で課題を表現]

## ✨「こうなったら最高じゃない？」 - 僕たちの解決策
> [ベネフィットを感情的に描写]

## 🎯 ターゲットユーザー
- **こんな人にピッタリ:** [一行で表現]

## 🛠️ このアプリでできること (主要機能)
- **[主要機能1]:** [説明]
- **[主要機能2]:** [説明] 
- **[主要機能3]:** [説明]

## 💰 ビジネス的な話（ちょっとだけ）
- [マネタイズの方針]

## 🤝 一緒に作りませんか？
- [参加や応援の呼びかけ]`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const pitchContent = completion.choices[0]?.message?.content || 'ピッチ生成に失敗しました。';
    console.log('Generated pitch content length:', pitchContent.length);
    return pitchContent;
  }

  private formatAnalysisForDisplay(analysis: ExternalEnvironmentAnalysis): string {
    return `## 📊 外部環境分析レポート

### 市場・顧客分析
${analysis.customer_analysis}

### 競合分析
${analysis.competitor_analysis}

### 自社分析
${analysis.company_analysis}

### PEST分析
${analysis.pest_analysis}

### 要約と戦略的提言
${analysis.summary_and_strategy}`;
  }

  private cleanJSONFromMarkdown(content: string): string {
    // Remove markdown code blocks (```json...``` or ```...```)
    const cleanedContent = content
      .replace(/^```json\s*\n?/i, '')  // Remove opening ```json
      .replace(/^```\s*\n?/i, '')      // Remove opening ```
      .replace(/\n?```\s*$/i, '')      // Remove closing ```
      .trim();
    
    return cleanedContent;
  }

  private ensureString(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else if (value === null || value === undefined) {
      return '';
    } else if (typeof value === 'object') {
      // If it's an object, convert to formatted JSON string
      return JSON.stringify(value, null, 2);
    } else {
      // For numbers, booleans, etc., convert to string
      return String(value);
    }
  }

  private formatProfitabilityForDisplay(assessment: ProfitabilityAssessment): string {
    const status = assessment.is_profitable ? "✅ 収益化可能" : "❌ 収益化困難";
    return `## 💰 収益性評価

### ${status}

${assessment.reason}`;
  }

  private formatFeasibilityForDisplay(assessment: FeasibilityAssessment): string {
    const status = assessment.is_feasible ? "✅ 実現可能" : "❌ 実現困難";
    return `## 🛠️ 実現性評価

### ${status}

${assessment.reason}`;
  }

  private formatLegalForDisplay(assessment: LegalAssessment): string {
    const status = assessment.is_compliant ? "✅ 法的問題なし" : "⚠️ 法的注意が必要";
    return `## ⚖️ 法的評価

### ${status}

${assessment.reason}`;
  }
}