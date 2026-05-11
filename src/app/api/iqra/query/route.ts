import { NextRequest, NextResponse } from 'next/server';
import { IQRAMemory } from '../../../../lib/iqra/memory';
import { iqraThink } from '../../../../lib/iqra/brain';

export async function POST(req: NextRequest) {
  try {
    const { query, mode = 'default' } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Search semantic memory for relevant echoes
    const echoes = await IQRAMemory.searchSemantic(query, 3);
    
    // Process the query through IQRA thinking engine
    const response = await iqraThink({ 
      input: query, 
      mode, 
      context: echoes.map(e => e.content) 
    });

    return NextResponse.json({
      response,
      echoes,
      timestamp: Date.now(),
      mode
    });

  } catch (error: any) {
    console.error('❌ IQRA Query API Error:', error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: Date.now()
    }, { status: 500 });
  }
}
