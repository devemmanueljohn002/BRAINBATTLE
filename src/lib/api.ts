export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
  }
}

export async function apiFetch(path: string, init: RequestInit = {}, timeoutMs = 45000) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers = new Headers(init.headers)
    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(path, {
      ...init,
      headers,
      cache: 'no-store',
      signal: controller.signal,
    })
    const text = await response.text()
    let data: unknown = null
    if (text) {
      try { data = JSON.parse(text) } catch { data = text }
    }

    if (!response.ok) {
      const payload = data as { detail?: string; error?: string } | null
      if (response.status === 401) throw new ApiError('Invalid ID or password. Please check your details and try again.', 401, data)
      throw new ApiError(payload?.detail || payload?.error || 'The request could not be completed.', response.status, data)
    }
    return { response, data }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The service is starting or taking longer than expected. Please try again.', 0)
    }
    throw new ApiError('Unable to connect. Please check your internet connection and try again.', 0)
  } finally {
    window.clearTimeout(timeout)
  }
}
