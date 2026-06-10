/**
 * Shared API utilities for admin panel.
 * Auth is handled via httpOnly session cookies (set by /api/admin/login).
 * No passwords or tokens stored in localStorage.
 */

export async function adminFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'same-origin', // sends httpOnly cookie automatically
    headers: {
      ...(options?.headers as Record<string, string> || {}),
    },
  });
}

export async function adminPost(url: string, body?: any): Promise<Response> {
  return adminFetch(url, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Upload an image file -> Vercel Blob, returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const res = await adminPost('/api/admin/upload', { filename: file.name, dataUrl });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}

/** Check if the current session cookie is valid */
export async function checkSession(): Promise<boolean> {
  try {
    const res = await adminFetch('/api/admin/session');
    if (!res.ok) return false;
    const data = await res.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
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
