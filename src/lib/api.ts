export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
    public code?: string,
  ) {
    super(message)
  }
}

function getErrorMessage(status: number, data: unknown) {
  const payload = data && typeof data === 'object'
    ? data as { detail?: unknown; error?: unknown; errorCode?: unknown }
    : null
  const code = typeof payload?.errorCode === 'string' ? payload.errorCode : undefined
  if (code === 'UPSTREAM_TIMEOUT') return 'The BRAINBATTLE service is taking too long to respond. Please retry.'
  if (code === 'UPSTREAM_CONNECTION_FAILED') return 'Unable to connect to the BRAINBATTLE service. Please check your connection and retry.'
  if (code === 'BACKEND_CONFIGURATION') return 'BRAINBATTLE service configuration is incorrect. Please contact support.'

  switch (status) {
    case 401: return 'Invalid ID or password. Please check your details and try again.'
    case 403:
      if (typeof payload?.detail === 'string') return payload.detail
      if (typeof payload?.error === 'string') return payload.error
      return 'Your account is not permitted to sign in. Please contact your school administrator.'
    case 404: return 'The login service could not be found. Please contact support.'
    case 422: return 'Please check your ID and password and try again.'
    case 500: return 'The login service encountered an internal error. Please try again later.'
    case 502:
    case 503:
    case 504: return 'The BRAINBATTLE service is temporarily unavailable. Please retry shortly.'
    default:
      if (typeof payload?.detail === 'string') return payload.detail
      if (typeof payload?.error === 'string') return payload.error
      return 'The request could not be completed. Please try again.'
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
    if (response.headers.get('x-brainbattle-cors-warning')) {
      console.warn('[BRAINBATTLE API] Backend CORS origin is not configured for this frontend', { path })
    }
    const text = await response.text()
    let data: unknown = null
    if (text) {
      try { data = JSON.parse(text) } catch { data = text }
    }

    if (!response.ok) {
      const payload = data && typeof data === 'object'
        ? data as { errorCode?: unknown }
        : null
      const code = typeof payload?.errorCode === 'string' ? payload.errorCode : undefined
      console.error('[BRAINBATTLE API] Request failed', { path, status: response.status, code })
      throw new ApiError(getErrorMessage(response.status, data), response.status, data, code)
    }
    return { response, data }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('[BRAINBATTLE API] Request timed out', { path, timeoutMs })
      throw new ApiError('The service is starting or taking longer than expected. Please try again.', 0)
    }
    console.error('[BRAINBATTLE API] Network or browser access failure', {
      path,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })
    throw new ApiError(
      'Unable to connect. Please check your internet connection. If it persists, the service URL or browser access policy may need correction.',
      0,
    )
  } finally {
    window.clearTimeout(timeout)
  }
}
