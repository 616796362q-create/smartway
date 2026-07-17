// In the browser use the Next.js /api proxy (avoids CORS + works without env vars).
// On the server (SSR/build) use the full backend URL from env.
function getApiBase(): string {
  if (typeof window !== 'undefined') return '/api'
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
}

export const API = getApiBase()

const REQUEST_TIMEOUT_MS = 45000
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY_MS
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)
      return res
    } catch (err) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)))
      } else {
        throw err
      }
    }
  }
  throw new Error('Max retries exceeded')
}

export async function apiPost(path: string, body: object) {
  const res = await fetchWithRetry(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiGet(path: string) {
  const res = await fetchWithRetry(`${API}${path}`, { cache: 'no-store' })
  return res.json()
}

export async function apiPut(path: string, body: object) {
  const res = await fetchWithRetry(`${API}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiDelete(path: string, username?: string) {
  const url = username ? `${API}${path}?username=${encodeURIComponent(username)}` : `${API}${path}`
  const res = await fetchWithRetry(url, { method: 'DELETE' })
  return res.json()
}

// Wake up the backend serverless function + Neon DB (free tier auto-suspends)
export async function pingBackend(): Promise<boolean> {
  const attempts = [
    `${API}/health`,
    `${API}/auth/users`,
  ]

  for (const url of attempts) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
      clearTimeout(timer)
      if (res.ok) return true
    } catch {
      // Try next endpoint
    }
  }
  return false
}
