import { NextRequest, NextResponse } from 'next/server';
import { SovereignConnector } from '../../../../../lib/iqra/quran/sovereign_connector';

/**
 * Sovereign Sync Cycle
 * Ensures memory layers and trust chain are in harmony.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('🔄 Cron: Triggering Sovereign Sync...');
    
    // Perform sovereign synchronization
    const sovereign = new SovereignConnector();
    const result = await sovereign.generate('sync', []);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Sovereign Sync complete.',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sovereign Sync Cron Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
