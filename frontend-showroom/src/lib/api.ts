export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const MAX_RETRIES = 1
const RETRY_DELAY = 500
const FETCH_TIMEOUT = 5000

export class APIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchJSON<T>(path: string, options?: { retries?: number }): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const maxRetries = options?.retries ?? MAX_RETRIES

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    try {
      const res = await fetch(`${API_BASE}${path}`, { headers, signal: controller.signal })
      clearTimeout(timeoutId)
      if (!res.ok) {
        throw new APIError(`API error: ${res.status} ${res.statusText}`, res.status)
      }
      return res.json()
    } catch (err) {
      clearTimeout(timeoutId)
      if (attempt < maxRetries) {
        await delay(RETRY_DELAY * (attempt + 1))
        continue
      }
      const message = err instanceof APIError ? err.message
        : err instanceof DOMException && err.name === 'AbortError' ? 'Request timeout'
        : 'Network error: unable to reach server'
      throw new APIError(message, 0)
    }
  }
  throw new APIError('Unexpected error', 0)
}

export function resolveImageUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const path = url.startsWith('/') ? url : `/${url}`
  return `${API_BASE}${path}`
}
