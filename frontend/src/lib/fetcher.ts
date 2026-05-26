const API_BASE = '';

export async function fetchJSON<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    // If unauthorized, clear session
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('agencyId');
      window.location.href = '/login'; 
    }

    let err: any = {};
    try {
      const text = await res.text();
      err = text ? JSON.parse(text) : { message: res.statusText };
    } catch (e) {
      err = { message: res.statusText };
    }
    
    const errorMessage = err.message || err.error || `Lỗi kết nối API (Status: ${res.status})`;
    const error = new Error(errorMessage) as any;
    error.status = res.status;
    throw error;
  }

  // Handle empty body (e.g. void endpoints returning HTTP 200)
  const text = await res.text();
  if (!text) return null as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null as unknown as T;
  }
}
