import { NextResponse } from 'next/server'; import { connect } from '@/lib/marketplaces/vinted/client';
export async function POST(req: Request){ try { return NextResponse.json(await connect(await req.json())); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Connect failed' }, { status: 400 }); } }
