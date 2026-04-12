// Avatar service cho upload và quản lý ảnh đại diện
import { apiRequest } from './apiClient';
import type { UploadAvatarResponse } from '../types/avatar';

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
  async uploadDoctorAvatar(file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>('/api/avatar/doctor', file, 'POST');
  },

  async uploadDoctorAvatarById(doctorId: string, file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>(`/api/avatar/doctor/${doctorId}`, file, 'POST');
  },

  async uploadPatientAvatar(file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>('/api/avatar/patient', file, 'POST');
  },

  async uploadPatientAvatarById(patientId: string, file: File): Promise<UploadAvatarResponse> {
    return apiUploadFile<UploadAvatarResponse>(`/api/avatar/patient/${patientId}`, file, 'POST');
  },

  async deleteDoctorAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/avatar/doctor', { method: 'DELETE' });
  },

  async deletePatientAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/avatar/patient', { method: 'DELETE' });
  },
};
