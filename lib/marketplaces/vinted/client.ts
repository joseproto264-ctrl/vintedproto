import { z } from 'zod';
import type { Listing } from '../../../types';

const VINTED_BASE = process.env.VINTED_BASE_URL || 'https://www.vinted.es';
const sessionSchema = z.object({ cookie: z.string().min(20).max(8000) });
const replySchema = z.object({ threadId: z.string().min(1), message: z.string().min(1).max(2000) });
export const listingSchema = z.object({ id:z.string(), photos:z.array(z.string()).max(12), title:z.string().min(3).max(80), brand:z.string().max(80), category:z.string().min(1).max(80), size:z.string().max(40), colour:z.string().max(40), condition:z.string().min(1).max(80), price:z.string().regex(/^\d+(\.\d{1,2})?$/), description:z.string().min(5).max(2000), status:z.enum(['Draft','Ready','Uploaded']), createdAt:z.string(), updatedAt:z.string() });

type VintedSession = { cookie: string; connectedAt: string; username?: string; avatar?: string; userId?: number };
let session: VintedSession | null = null;

function safeProfile(user: any) {
  const source = user?.user ?? user;
  return { id: source?.id, username: source?.login ?? source?.username ?? source?.name ?? null, avatar: source?.photo?.url ?? source?.photo?.thumbnails?.[0]?.url ?? null, raw: source };
}

async function vintedFetch(path: string, init: RequestInit = {}) {
  if (!session) throw new Error('Not connected. Paste a Vinted session cookie first.');
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  headers.set('cookie', session.cookie);
  headers.set('user-agent', 'AutoVintedAI/0.2 backend-only experimental client');
  const res = await fetch(`${VINTED_BASE}${path}`, { ...init, headers, cache: 'no-store' });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) throw new Error(`Vinted request failed (${res.status} ${res.statusText}) for ${path}: ${typeof body === 'string' ? body.slice(0, 400) : JSON.stringify(body).slice(0, 400)}`);
  return body;
}

export function getStatus(){ return { connected: Boolean(session), username: session?.username ?? null, avatar: session?.avatar ?? null, userId: session?.userId ?? null, connectedAt: session?.connectedAt ?? null, library: 'Backend-only session-cookie adapter; selected after GitHub review because maintained Node libraries do not safely support authenticated listing management.' }; }
export async function connectSession(raw: unknown){ const { cookie } = sessionSchema.parse(raw); session = { cookie, connectedAt: new Date().toISOString() }; try { const profile = await getProfile(); session.username = profile.username ?? undefined; session.avatar = profile.avatar ?? undefined; session.userId = profile.id ?? undefined; return getStatus(); } catch (error) { session = null; throw error; } }
export async function testConnection(){ const profile = await getProfile(); return { ok:true, profile }; }
export async function getProfile(){ const data = await vintedFetch('/api/v2/users/current'); return safeProfile(data); }
export async function getProducts(){ const profile = await getProfile(); if (!profile.id) throw new Error('Connected profile did not include a user id, so products cannot be loaded. Open Vinted manually.'); const active = await vintedFetch(`/api/v2/users/${profile.id}/items?page=1&per_page=24`); let sold: any = { unsupported: true, error: 'Sold listings endpoint is not documented by Vinted public APIs for this session-cookie adapter.' }; try { sold = await vintedFetch(`/api/v2/users/${profile.id}/items?page=1&per_page=24&status[]=sold`); } catch(e){ sold = { unsupported: true, error: e instanceof Error ? e.message : 'Sold listing request failed' }; } return { active, sold }; }
export async function getRatings(){ const profile = await getProfile(); if (!profile.id) throw new Error('Connected profile did not include a user id, so ratings cannot be loaded.'); return vintedFetch(`/api/v2/users/${profile.id}/feedbacks?page=1&per_page=20`); }
export async function getMessages(){ try { return await vintedFetch('/api/v2/conversations?page=1&per_page=20'); } catch(e) { throw new Error(`Messages are unsupported or blocked for this session: ${e instanceof Error ? e.message : 'unknown error'}. Open in Vinted fallback required.`); } }
export async function reply(raw: unknown){ replySchema.parse(raw); throw new Error('Replying to Vinted messages is not safely supported by the selected unofficial session-cookie adapter. Open the conversation in Vinted.'); }
export async function uploadListing(raw: unknown){ if(!session) throw new Error('Not connected. Paste a Vinted session cookie first.'); listingSchema.parse(raw as Listing); throw new Error('Uploading listings is not safely supported by the selected unofficial session-cookie adapter. Use Copy Mode and Open Vinted fallback.'); }
export async function disconnect(){ session = null; return getStatus(); }
