import { NextResponse } from 'next/server'; import { connectSession } from '@/lib/marketplaces/vinted/client';
export async function POST(req: Request){ try { return NextResponse.json(await connectSession(await req.json())); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Session connection failed', debug: (e as any)?.debug }, { status: 400 }); } }
