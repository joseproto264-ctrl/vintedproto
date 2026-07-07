import { NextResponse } from 'next/server'; import { getMessages } from '@/lib/marketplaces/vinted/client';
export async function GET(){ try { return NextResponse.json(await getMessages()); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Messages request failed', debug: (e as any)?.debug }, { status: 400 }); } }
