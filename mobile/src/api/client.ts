import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://192.168.1.34:8080';

export async function fetchJSON<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user', 'agencyId']);
    }
    let err: any = {};
    try {
      const text = await res.text();
      err = text ? JSON.parse(text) : { message: res.statusText };
    } catch {
      err = { message: res.statusText };
    }
    const errorMessage = err.message || err.error || `Lỗi kết nối API (Status: ${res.status})`;
    const error = new Error(errorMessage) as any;
    error.status = res.status;
    throw error;
  }

  const text = await res.text();
  if (!text) return null as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null as unknown as T;
  }
}
