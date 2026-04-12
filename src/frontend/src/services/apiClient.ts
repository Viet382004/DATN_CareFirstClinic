// src/services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5293';

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(status: number, statusText: string, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!cleanEndpoint.startsWith('/api')) {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;

  let finalUrl = url;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query.append(key, String(value));
      }
    });
    if (query.toString()) finalUrl += `?${query.toString()}`;
  }

  // Đọc token MỖI LẦN gọi request (an toàn hơn)
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`📤 Request ${endpoint} → Có token`);
  } else {
    console.warn(`⚠️ Request ${endpoint} → KHÔNG CÓ TOKEN`);
  }

  try {
    const response = await fetch(finalUrl, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    console.log(`📥 Response ${endpoint}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch { }

      if (response.status === 401) {
        console.warn('🔑 Token không hợp lệ hoặc hết hạn → Logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }

      throw new ApiError(
        response.status,
        response.statusText,
        errorData?.message || `HTTP Error: ${response.status}`,
        errorData
      );
    }

    if (response.status === 204) return {} as T;
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions
export const apiGet = <T>(endpoint: string, params?: Record<string, any>) =>
  apiRequest<T>(endpoint, { method: 'GET', params });

export const apiPost = <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    params
  });

export const apiPut = <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    params
  });
export const apiPatch = <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
  apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    params
  });
export const apiDelete = <T>(endpoint: string, params?: Record<string, any>) =>
  apiRequest<T>(endpoint, { method: 'DELETE', params });