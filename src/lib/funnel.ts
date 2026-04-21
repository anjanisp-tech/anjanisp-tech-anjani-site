// src/lib/funnel.ts
// Client-side event emitter for funnel_events (Supabase).
// Schema, endpoint, anon key, and identity keys MUST match public/os/index.html
// so that anon_id and session_id are shared across /os and /services.
//
// RLS allows anon INSERTs for event_type in:
//   page_view | downloaded | services_cta_click | share_click

const ENDPOINT =
  'https://ydjauliaggmpunfehzzo.supabase.co/rest/v1/funnel_events';

const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkamF1bGlhZ2dtcHVuZmVoenpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Nzg2OTUsImV4cCI6MjA5MjE1NDY5NX0.ht_XuE-x1zEriZzWYKxtZySYhI7BYKvw6b1jss5CmE4';

const ANON_STORAGE_KEY = '_apf_anon';
const SESSION_STORAGE_KEY = '_apf_sess';

function uuid(): string {
  // RFC4122-ish v4, good enough for anon_id
  const c = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
    ? (crypto as any).randomUUID()
    : null;
  if (c) return c as string;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem(ANON_STORAGE_KEY);
    if (!id) {
      id = uuid();
      window.localStorage.setItem(ANON_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = uuid();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

function getUtm() {
  if (typeof window === 'undefined') {
    return { source: null, medium: null, campaign: null };
  }
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      source: p.get('utm_source'),
      medium: p.get('utm_medium'),
      campaign: p.get('utm_campaign'),
    };
  } catch {
    return { source: null, medium: null, campaign: null };
  }
}

export type FunnelEventType =
  | 'page_view'
  | 'downloaded'
  | 'services_cta_click'
  | 'share_click';

export interface FunnelEmit {
  emit: (
    event_type: FunnelEventType,
    properties?: Record<string, unknown>
  ) => void;
}

function emit(
  event_type: FunnelEventType,
  properties: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return;
  const utm = getUtm();
  const payload = {
    event_type,
    anon_id: getAnonId(),
    session_id: getSessionId(),
    source: utm.source,
    medium: utm.medium,
    campaign: utm.campaign,
    path: window.location.pathname || '/',
    referrer: document.referrer || null,
    properties,
  };
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* silent */
    });
  } catch {
    /* silent */
  }
}

export const funnel: FunnelEmit = { emit };
