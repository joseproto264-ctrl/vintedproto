import { NextResponse } from 'next/server'; import { uploadListing } from '@/lib/marketplaces/vinted/client';
export async function POST(req: Request){ try { return NextResponse.json(await uploadListing(await req.json())); } catch(e){ return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 400 }); } }
