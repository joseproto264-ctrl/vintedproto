import { NextResponse } from 'next/server'; import { reply } from '@/lib/marketplaces/vinted/client';
export async function POST(req: Request){ try { return NextResponse.json(await reply(await req.json())); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Reply failed', debug: (e as any)?.debug }, { status: 400 }); } }
