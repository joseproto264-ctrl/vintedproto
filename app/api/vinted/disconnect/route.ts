import { NextResponse } from 'next/server'; import { disconnect } from '@/lib/marketplaces/vinted/client';
export async function POST(){ return NextResponse.json(await disconnect()); }
