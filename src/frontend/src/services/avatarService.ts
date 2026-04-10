// Avatar service cho upload và quản lý ảnh đại diện
import { apiRequest } from './apiClient';

export interface UploadAvatarResponse {
  message: string;
  avatarUrl?: string;
}

// Hàm upload file với FormData
async function apiUploadFile<T>(
  endpoint: string,
  file: File,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      const text = await response.text().catch(() => '');
      errorData = text ? { message: text } : { message: response.statusText };
    }

    if (typeof errorData === 'string' || !errorData) {
      errorData = { message: String(errorData) };
    }

    // Handle 401
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }

  return await response.json();
}

export const avatarService = {
  // Upload avatar cho doctor (tự upload)
  async uploadDoctorAvatar(file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>('/avatar/doctor', file, 'POST');
  },

  // Admin upload avatar cho doctor cụ thể
  async uploadDoctorAvatarById(doctorId: string, file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>(`/avatar/doctor/${doctorId}`, file, 'POST');
  },

  // Upload avatar cho patient (tự upload)
  async uploadPatientAvatar(file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>('/avatar/patient', file, 'POST');
  },

  // Admin upload avatar cho patient cụ thể
  async uploadPatientAvatarById(patientId: string, file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>(`/avatar/patient/${patientId}`, file, 'POST');
  },

  // Xóa avatar doctor
  async deleteDoctorAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/avatar/doctor', { method: 'DELETE' });
  },

  // Xóa avatar patient
  async deletePatientAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/avatar/patient', { method: 'DELETE' });
  },
};