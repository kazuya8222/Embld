import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    console.log('=== Webhook Test ===');
    console.log('Body:', body.substring(0, 200) + '...');
    console.log('Signature:', signature);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    return NextResponse.json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasSignature: !!signature
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook test endpoint ready',
    timestamp: new Date().toISOString()
  });
}