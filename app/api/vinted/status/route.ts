import { NextResponse } from 'next/server'; import { getStatus } from '@/lib/marketplaces/vinted/client';
export async function GET(){ return NextResponse.json(getStatus()); }
