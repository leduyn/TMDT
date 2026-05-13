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
    let err: any = {};
    try {
      const text = await res.text();
      err = text ? JSON.parse(text) : { message: res.statusText };
    } catch (e) {
      err = { message: res.statusText };
    }
    const errorMessage = err.message || err.error || `Lỗi kết nối API (Status: ${res.status})`;
    throw new Error(errorMessage);
  }
  return res.json();
}
