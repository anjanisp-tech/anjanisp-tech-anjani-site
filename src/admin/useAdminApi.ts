/**
 * Shared API utilities for admin panel.
 * Centralizes auth token retrieval and authenticated fetch calls.
 */

export function getSecret(): string {
  return localStorage.getItem('admin_pwd') || '';
}

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Authorization': `Bearer ${getSecret()}`,
    ...extra,
  };
}

export async function adminFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = {
    ...authHeaders(),
    ...(options?.headers as Record<string, string> || {}),
  };
  return fetch(url, { ...options, headers });
}

export async function adminPost(url: string, body?: any): Promise<Response> {
  return adminFetch(url, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Download helper for CSV export */
export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
