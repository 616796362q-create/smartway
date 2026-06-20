export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'


export async function apiPost(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, { cache: 'no-store' })
  return res.json()
}

export async function apiPut(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function apiDelete(path: string, username?: string) {
  const url = username ? `${API}${path}?username=${encodeURIComponent(username)}` : `${API}${path}`
  const res = await fetch(url, { method: 'DELETE' })
  return res.json()
}
