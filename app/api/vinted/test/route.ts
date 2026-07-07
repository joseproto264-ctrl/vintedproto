import { NextResponse } from 'next/server'; import { testConnection } from '@/lib/marketplaces/vinted/client';
export async function POST(){ try { return NextResponse.json(await testConnection()); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Test failed', debug: (e as any)?.debug }, { status: 400 }); } }
