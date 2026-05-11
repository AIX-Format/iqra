import { NextRequest, NextResponse } from 'next/server';
import { IQRAMemory } from '../../../../../lib/iqra/memory';

/**
 * Arba'ūn Tazkiyah Cycle (40)
 * Purifies memory and summarizes experiences.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('🧼 Cron: Triggering Tazkiyah purification...');
    
    // Perform memory purification
    await IQRAMemory.performPurification();
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Tazkiyah performed successfully.',
      timestamp: new Date().toISOString(),
      cycles: await IQRAMemory.getCycleCounter()
    });
  } catch (error) {
    console.error('Tazkiyah Cron Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
