export const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').trim()

// Timeout wrapper: abort if request takes longer than ms
function withTimeout(promise: Promise<Response>, ms = 20000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return promise.finally(() => clearTimeout(timer))
}

// Retry a fetch up to `retries` times with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  delayMs = 1500
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20000)
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

// Ping the backend to wake up the Neon DB (free tier auto-suspends)
// Call this early in the app lifecycle (e.g. layout or login page)
export async function pingBackend(): Promise<boolean> {
  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 30000)
    const res = await fetch(`${API}/auth/users`, { signal: controller.signal, cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}
