import { NextRequest } from 'next/server'
import { BACKEND_URL } from '@/lib/backend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const path = (context.params.path || []).map(encodeURIComponent).join('/')
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('content-length')
  let body: ArrayBuffer | undefined
  if (!['GET', 'HEAD'].includes(request.method)) body = await request.arrayBuffer()

  let backend: URL
  try {
    backend = new URL(BACKEND_URL)
    if (
      !['http:', 'https:'].includes(backend.protocol) ||
      (backend.pathname !== '/' && backend.pathname !== '') ||
      backend.search ||
      backend.hash ||
      backend.username ||
      backend.password
    ) {
      throw new Error('Invalid backend base URL')
    }
  } catch {
    console.error('[api-proxy] Invalid backend configuration', {
      method: request.method,
      path,
    })
    return Response.json({
      errorCode: 'BACKEND_CONFIGURATION',
      error: 'BRAINBATTLE API configuration is invalid. Please contact support.',
    }, { status: 500 })
  }

  const target = new URL(`/api/v1/${path}${request.nextUrl.search}`, backend)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)
  let timedOut = false
  const onTimeout = () => { timedOut = true }
  controller.signal.addEventListener('abort', onTimeout, { once: true })

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      signal: controller.signal,
    })
    const requestOrigin = request.headers.get('origin')
    const corsWarning = Boolean(
      requestOrigin &&
      upstream.headers.get('access-control-allow-origin') !== requestOrigin,
    )
    if (corsWarning) {
      console.warn('[api-proxy] Backend CORS does not allow the frontend origin', {
        method: request.method,
        path,
        backendOrigin: backend.origin,
        frontendOrigin: requestOrigin,
      })
    }
    if (upstream.status >= 400) {
      console.warn('[api-proxy] Backend returned an HTTP error', {
        method: request.method,
        path,
        backendOrigin: backend.origin,
        status: upstream.status,
      })
    }
    const responseHeaders = new Headers()
    upstream.headers.forEach((value, key) => {
      if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.append(key, value)
      }
    })
    if (corsWarning) responseHeaders.set('x-brainbattle-cors-warning', 'origin-not-allowed')
    return new Response(request.method === 'HEAD' ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    const cause = error instanceof Error && 'cause' in error ? error.cause : undefined
    const causeCode = cause && typeof cause === 'object' && 'code' in cause &&
      typeof cause.code === 'string' ? cause.code : undefined
    const errorCode = timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_CONNECTION_FAILED'
    console.error('[api-proxy] Backend request failed', {
      method: request.method,
      path,
      backendOrigin: backend.origin,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      causeCode,
      errorCode,
    })
    return Response.json({
      errorCode,
      error: timedOut
        ? 'BRAINBATTLE is taking longer than expected to respond. Please retry.'
        : 'Unable to connect to the BRAINBATTLE API. Please retry shortly.',
    }, { status: 502 })
  } finally {
    clearTimeout(timeout)
    controller.signal.removeEventListener('abort', onTimeout)
  }
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const PUT = proxy
export const DELETE = proxy
export const OPTIONS = proxy
