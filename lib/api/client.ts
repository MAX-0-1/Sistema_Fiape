import type { ApiErrorPayload } from './types';

const DEFAULT_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 10000);

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configuredUrl) {
    return '';
  }

  return configuredUrl.endsWith('/') ? configuredUrl : `${configuredUrl}/`;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem('fiape_auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token?: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (token) {
      localStorage.setItem('fiape_auth_token', token);
    } else {
      localStorage.removeItem('fiape_auth_token');
    }
  } catch {
    console.warn('[api] no se pudo guardar el token de autenticación');
  }
}

function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new ApiError(0, 'NEXT_PUBLIC_API_BASE_URL is not configured');
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return new URL(normalizedPath, baseUrl).toString();
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const token = getAuthToken();
    const headers = new Headers(init.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(buildUrl(path), {
      ...init,
      headers,
      signal: controller.signal,
    });

    const payload = await parseBody(response);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        (payload as ApiErrorPayload | null)?.message || (payload as ApiErrorPayload | null)?.error || 'Request failed',
        payload as ApiErrorPayload | undefined,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }

    throw new ApiError(500, error instanceof Error ? error.message : 'Unexpected error');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const api = {
  get<T>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, init?: RequestInit) {
    return request<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined });
  },
  put<T>(path: string, body?: unknown, init?: RequestInit) {
    return request<T>(path, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  },
  patch<T>(path: string, body?: unknown, init?: RequestInit) {
    return request<T>(path, { ...init, method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  },
  delete<T>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: 'DELETE' });
  },
};
