import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AgentWorkflow } from '@/lib/agent/workflow';
import { 
  InterviewState,
  NodeId,
  StreamingMessage,
  InterviewStateSchema
} from '@/lib/types/agent';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sessionId, state, node } = body;

    if (!sessionId || !state || !node) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Validate state
    let agentState: InterviewState;
    try {
      agentState = InterviewStateSchema.parse(state);
    } catch (error) {
      console.error('Invalid state:', error);
      return NextResponse.json(
        { error: 'Invalid state format' },
        { status: 400 }
      );
    }

    const workflow = new AgentWorkflow();

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Only certain nodes support streaming
          const streamingNodes: NodeId[] = [
            'generate_professional_requirements',
            'analyze_environment',
            'generate_pitch'
          ];

          if (!streamingNodes.includes(node)) {
            controller.close();
            return;
          }

          // Execute the node and stream the response
          const result = await workflow.executeNode(node, agentState);
          
          if (result.response.type === 'streaming') {
            const streamingResponse = result.response as StreamingMessage;
            
            // Simulate streaming by sending chunks
            const content = streamingResponse.content;
            const chunks = content.split('\n');
            
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i] + (i < chunks.length - 1 ? '\n' : '');
              const isComplete = i === chunks.length - 1;
              
              const streamChunk: StreamingMessage = {
                type: 'streaming',
                content: chunk,
                isComplete,
                node: streamingResponse.node
              };

              // Send chunk as Server-Sent Event
              const data = `data: ${JSON.stringify(streamChunk)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));

              // Add small delay for realistic streaming effect
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Stream API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}