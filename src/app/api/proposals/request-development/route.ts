import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { proposalId } = await request.json();

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if proposal exists and belongs to user
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, user_id, status')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (proposal.status !== '未提出') {
      return NextResponse.json({ error: 'この企画書はすでに提出済みです' }, { status: 400 });
    }

    // Check user's credit balance
    const { data: userProfile } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    const currentCredits = userProfile?.credits_balance || 0;
    if (currentCredits < 100) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Deduct credits
    const creditDeducted = await deductCredits(
      user.id,
      100,
      'development_request',
      `開発依頼: ${proposalId}`,
      { proposal_id: proposalId }
    );

    if (!creditDeducted) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    // Update proposal status
    const { error: updateError } = await supabase
      .from('proposals')
      .update({
        status: '審査中',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', proposalId);

    if (updateError) {
      console.error('Error updating proposal status:', updateError);
      return NextResponse.json({ error: 'Failed to update proposal status' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}