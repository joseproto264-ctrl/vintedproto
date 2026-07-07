import { NextResponse } from 'next/server'; import { getProducts } from '@/lib/marketplaces/vinted/client';
export async function GET(){ try { return NextResponse.json(await getProducts()); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Products request failed' }, { status: 400 }); } }
