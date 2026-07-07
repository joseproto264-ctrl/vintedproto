import { NextResponse } from 'next/server'; import { getProfile } from '@/lib/marketplaces/vinted/client';
export async function GET(){ try { return NextResponse.json(await getProfile()); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Profile request failed' }, { status: 400 }); } }
