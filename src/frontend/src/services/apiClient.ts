// API Client base cho tất cả requests
const API_BASE_URL = import.meta.env.VITE_API_URL ;
if (!API_BASE_URL) {
  console.error('VITE_API_URL chưa được cấu hình trong .env');
}
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

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Get token from localStorage
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    });

    let errorData: any = null;
    if (!response.ok) {
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        errorData = text ? { message: text } : { message: response.statusText };
      }

      if (typeof errorData === 'string' || !errorData) {
        errorData = { message: String(errorData) };
      }

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }

      throw new ApiError(
        response.status,
        response.statusText,
        errorData.message || `HTTP Error: ${response.status}`,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', params });
}

export async function apiPost<T>(
  endpoint: string,
  body?: any,
  params?: Record<string, any>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    params,
  });
}

export async function apiPut<T>(
  endpoint: string,
  body?: any,
  params?: Record<string, any>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    params,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  body?: any,
  params?: Record<string, any>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    params,
  });
}

export async function apiDelete<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE', params });
}
