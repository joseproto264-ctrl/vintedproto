import { z } from 'zod';
import type { Listing } from '../../../types';

const VINTED_BASE = process.env.VINTED_BASE_URL || 'https://www.vinted.es';
const cookieHeaderSchema = z.object({ cookie: z.string().min(20).max(12000) });
const replySchema = z.object({ threadId: z.string().min(1), message: z.string().min(1).max(2000) });
export const listingSchema = z.object({ id:z.string(), photos:z.array(z.string()).max(12), title:z.string().min(3).max(80), brand:z.string().max(80), category:z.string().min(1).max(80), size:z.string().max(40), colour:z.string().max(40), condition:z.string().min(1).max(80), price:z.string().regex(/^\d+(\.\d{1,2})?$/), description:z.string().min(5).max(2000), status:z.enum(['Draft','Ready','Uploaded']), createdAt:z.string(), updatedAt:z.string() });

type SafeDebug = { cookieLength?: number; cookiePairs?: number; endpoint?: string; statusCode?: number };
type VintedSession = { cookieHeader: string; connectedAt: string; username?: string; avatar?: string; userId?: number; debug: SafeDebug };
export class VintedClientError extends Error { constructor(message: string, public debug: SafeDebug = {}) { super(message); } }
let session: VintedSession | null = null;

function analyzeCookieHeader(cookieHeader: string): Required<Pick<SafeDebug, 'cookieLength' | 'cookiePairs'>> {
  const pairs = cookieHeader.split(';').map(pair => pair.trim()).filter(Boolean);
  const hasCookieNames = pairs.some(pair => /^[A-Za-z0-9_.-]+=/.test(pair));
  if (!cookieHeader.includes(';') || !hasCookieNames || pairs.length < 2) {
    throw new VintedClientError('This looks like a single token, not a full Cookie header.', { cookieLength: cookieHeader.length, cookiePairs: pairs.length });
  }
  return { cookieLength: cookieHeader.length, cookiePairs: pairs.length };
}

function safeProfile(user: any) {
  const source = user?.user ?? user?.current_user ?? user?.user_data ?? user;
  return { id: source?.id, username: source?.login ?? source?.username ?? source?.name ?? null, avatar: source?.photo?.url ?? source?.photo?.thumbnails?.[0]?.url ?? null, raw: source };
}

async function vintedFetch(path: string, init: RequestInit = {}) {
  if (!session) throw new VintedClientError('Not connected. Paste the full Vinted Cookie request header first.');
  const headers = new Headers(init.headers);
  headers.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 AutoVintedAI/0.3');
  headers.set('Accept', 'application/json, text/plain, */*');
  headers.set('Accept-Language', 'es-ES,es;q=0.9,en;q=0.8');
  headers.set('Referer', 'https://www.vinted.es/');
  headers.set('Origin', 'https://www.vinted.es');
  headers.set('Cookie', session.cookieHeader);
  const res = await fetch(`${VINTED_BASE}${path}`, { ...init, headers, cache: 'no-store' });
  session.debug = { ...session.debug, endpoint: path, statusCode: res.status };
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const bodyText = typeof body === 'string' ? body.slice(0, 240) : JSON.stringify(body).slice(0, 240);
    const rejected = res.status === 401 || /invalid_authentication_token/i.test(bodyText);
    throw new VintedClientError(rejected ? 'Vinted rejected this cookie. Make sure you copied the full Cookie request header from a logged-in vinted.es Network request.' : `Vinted request failed (${res.status} ${res.statusText}) for ${path}: ${bodyText}`, session.debug);
  }
  return body;
}

async function getCurrentUserWithFallbacks() {
  const endpoints = ['/api/v2/users/current', '/api/v2/users/me', '/api/v2/current_user'];
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try { return { data: await vintedFetch(endpoint), endpoint }; } catch (error) { lastError = error; }
  }
  throw lastError;
}

export function getStatus(){ return { connected: Boolean(session), username: session?.username ?? null, avatar: session?.avatar ?? null, userId: session?.userId ?? null, connectedAt: session?.connectedAt ?? null, debug: session?.debug ?? null, library: 'Backend-only full Cookie header adapter with browser-like headers and current-user endpoint fallbacks.' }; }
export async function connectSession(raw: unknown){ const { cookie } = cookieHeaderSchema.parse(raw); const debug = analyzeCookieHeader(cookie); session = { cookieHeader: cookie, connectedAt: new Date().toISOString(), debug }; try { const profile = await getProfile(); session.username = profile.username ?? undefined; session.avatar = profile.avatar ?? undefined; session.userId = profile.id ?? undefined; return getStatus(); } catch (error) { const safeDebug = session.debug; session = null; if (error instanceof VintedClientError) throw error; throw new VintedClientError('Vinted rejected this cookie. Make sure you copied the full Cookie request header from a logged-in vinted.es Network request.', safeDebug); } }
export async function testConnection(){ const profile = await getProfile(); return { ok:true, profile, debug: session?.debug ?? null }; }
export async function getProfile(){ const { data } = await getCurrentUserWithFallbacks(); return safeProfile(data); }
export async function getProducts(){ const profile = await getProfile(); if (!profile.id) throw new VintedClientError('Connected profile did not include a user id, so products cannot be loaded. Open Vinted manually.', session?.debug ?? {}); const active = await vintedFetch(`/api/v2/users/${profile.id}/items?page=1&per_page=24`); let sold: any = { unsupported: true, error: 'Sold listings endpoint is not documented by Vinted public APIs for this session-cookie adapter.' }; try { sold = await vintedFetch(`/api/v2/users/${profile.id}/items?page=1&per_page=24&status[]=sold`); } catch(e){ sold = { unsupported: true, error: e instanceof Error ? e.message : 'Sold listing request failed', debug: e instanceof VintedClientError ? e.debug : undefined }; } return { active, sold, debug: session?.debug ?? null }; }
export async function getRatings(){ const profile = await getProfile(); if (!profile.id) throw new VintedClientError('Connected profile did not include a user id, so ratings cannot be loaded.', session?.debug ?? {}); return vintedFetch(`/api/v2/users/${profile.id}/feedbacks?page=1&per_page=20`); }
export async function getMessages(){ try { return await vintedFetch('/api/v2/conversations?page=1&per_page=20'); } catch(e) { throw new VintedClientError(`Messages are unsupported or blocked for this session: ${e instanceof Error ? e.message : 'unknown error'}. Open in Vinted fallback required.`, e instanceof VintedClientError ? e.debug : session?.debug ?? {}); } }
export async function reply(raw: unknown){ replySchema.parse(raw); throw new VintedClientError('Replying to Vinted messages is not safely supported by the selected unofficial session-cookie adapter. Open the conversation in Vinted.', session?.debug ?? {}); }
export async function uploadListing(raw: unknown){ if(!session) throw new VintedClientError('Not connected. Paste the full Vinted Cookie request header first.'); listingSchema.parse(raw as Listing); throw new VintedClientError('Uploading listings is not safely supported by the selected unofficial session-cookie adapter. Use Copy Mode and Open Vinted fallback.', session.debug); }
export async function disconnect(){ session = null; return getStatus(); }
