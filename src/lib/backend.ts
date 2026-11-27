import { cookies } from 'next/headers'

export const BACKEND_URL = (
  process.env.FASTAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://brainbattle-backend-5tno.onrender.com'
).replace(/\/$/, '')

export async function backendFetch(path: string, init: RequestInit = {}) {
  const cookieStore = cookies()
  const cookieName = process.env.SESSION_COOKIE_NAME || 'sid'
  const sid = cookieStore.get(cookieName)?.value
  const headers = new Headers(init.headers)
  if (sid) headers.set('cookie', `${cookieName}=${sid}`)
  return fetch(`${BACKEND_URL}${path}`, { ...init, headers, cache: 'no-store' })
}

