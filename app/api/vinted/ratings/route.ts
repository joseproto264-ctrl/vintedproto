import { NextResponse } from 'next/server'; import { getRatings } from '@/lib/marketplaces/vinted/client';
export async function GET(){ try { return NextResponse.json(await getRatings()); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Ratings request failed' }, { status: 400 }); } }
