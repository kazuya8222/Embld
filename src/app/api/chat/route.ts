import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AgentWorkflow } from '@/lib/agent/workflow';
import { 
  AgentChatRequest,
  InterviewState,
  NodeId,
  InterviewStateSchema
} from '@/lib/types/agent';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Agent API Request Start ===');
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Unauthorized access');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json() as AgentChatRequest;
    console.log('Request body:', { 
      message: body.message,
      sessionId: body.sessionId,
      agentType: body.agentType,
      hasState: !!body.state,
      currentNode: body.currentNode
    });
    
    const { message, sessionId, agentType, state, currentNode, history } = body;

    if (!sessionId || !agentType) {
      console.error('Missing required fields:', { message: !!message, sessionId: !!sessionId, agentType: !!agentType });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Allow empty message for automatic node progression
    if (!message) {
      console.log('Empty message - automatic node progression');
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get existing state from session metadata if available
    let agentState: InterviewState;
    if (state) {
      console.log('Using provided state');
      try {
        agentState = InterviewStateSchema.parse(state);
      } catch (error) {
        console.error('Invalid provided state:', error);
        return NextResponse.json(
          { error: 'Invalid state format' },
          { status: 400 }
        );
      }
    } else if (session.metadata?.agent_state) {
      console.log('Using existing session state');
      try {
        agentState = InterviewStateSchema.parse(session.metadata.agent_state);
      } catch (error) {
        console.error('Invalid session state:', error);
        // Fallback to creating new state
        agentState = createInitialState(message);
      }
    } else {
      console.log('Creating new initial state');
      agentState = createInitialState(message);
    }

    const workflow = new AgentWorkflow();
    const startNode: NodeId = currentNode || session.metadata?.current_node || "clarification_interview";
    
    console.log('Executing node:', startNode);
    console.log('Agent state:', {
      initial_problem: agentState.initial_problem,
      user_request: agentState.user_request,
      clarification_interview_log: agentState.clarification_interview_log.length
    });

    // Execute the workflow node
    const result = await workflow.executeNode(startNode, agentState, message || undefined);
    
    console.log('Node execution result:', {
      responseType: result.response.type,
      nextNode: result.nextNode,
      hasChoices: 'choices' in result.response ? result.response.choices?.length : 'N/A'
    });

    // Apply any state patch from ModelPlan responses
    let finalState = result.nextState;
    if (result.response.type === 'plan' && 'statePatch' in result.response && result.response.statePatch) {
      finalState = { ...finalState, ...result.response.statePatch };
    }

    console.log('Final state before saving:', {
      interview_log_length: finalState.clarification_interview_log.length,
      user_request_length: finalState.user_request.length,
      current_question_index: finalState.current_question_index,
      clarification_answers: finalState.clarification_answers
    });

    // Store updated state in session metadata
    const updateResult = await supabase
      .from('chat_sessions')
      .update({
        metadata: {
          agent_state: finalState,
          current_node: result.nextNode || startNode,
          updated_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateResult.error) {
      console.error('Failed to update session:', updateResult.error);
    }

    console.log('=== Agent API Request End ===');

    return NextResponse.json({
      response: result.response,
      state: finalState,
      nextNode: result.nextNode,
      isComplete: !result.nextNode && result.response.type !== 'question'
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function createInitialState(message: string): InterviewState {
  // 初期状態では3つの質問をこれから聞くので、初期値は空にする
  return {
    initial_problem: "",
    initial_persona: "",
    initial_solution: "",
    clarification_interview_log: "",
    clarification_answers: {},
    current_question_index: 0,
    detailed_questions: [],
    detailed_answers: {},
    current_detailed_question_index: 0,
    user_request: "",
    personas: [],
    interviews: [],
    professional_requirements_doc: "",
    consultant_analysis_report: undefined,
    iteration: 0,
    is_information_sufficient: false,
    evaluation_result: undefined,
    followup_round: 0,
    pitch_document: "",
    profitability: undefined,
    feasibility: undefined,
    legal: undefined,
    augment_personas: false
  };
}

