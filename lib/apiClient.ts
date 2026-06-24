import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store/rootReducer'
import type { AuthTokensResponse } from '@/types/api'
import { clearSessionCookie, hasSessionCookie } from '@/lib/auth-session'
import { refreshSessionOnce } from '@/lib/auth-refresh'
import { waitForAuthReady } from '@/lib/auth-ready'
import { clearCredentials, setCredentials } from '@/features/auth/authSlice'
import { clientApiUrl } from '@/lib/api-url'

const baseUrl = clientApiUrl()

export const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

function isAuthEndpoint(requestUrl: string): boolean {
  return (
    requestUrl.includes('/auth/login') ||
    requestUrl.includes('/auth/register') ||
    requestUrl.includes('/auth/refresh')
  )
}

type RefreshOutcome =
  | { ok: true; data: { data: AuthTokensResponse } }
  | { ok: false; unauthorized: boolean }

async function tryRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<RefreshOutcome> {
  return refreshSessionOnce(async () => {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )
    if (refreshResult.data) {
      return { ok: true, data: refreshResult.data as { data: AuthTokensResponse } }
    }
    return { ok: false, unauthorized: refreshResult.error?.status === 401 }
  })
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const requestUrl = typeof args === 'string' ? args : args.url
  const skipReauth = isAuthEndpoint(requestUrl)

  const state = api.getState() as RootState
  if (
    typeof document !== 'undefined' &&
    !skipReauth &&
    !state.auth.authReady &&
    hasSessionCookie()
  ) {
    await waitForAuthReady()
  }

  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401 && !skipReauth) {
    const refreshed = await tryRefresh(api, extraOptions)

    if (refreshed.ok) {
      api.dispatch(
        setCredentials({
          accessToken: refreshed.data.data.accessToken,
          user: refreshed.data.data.user,
        }),
      )
      result = await baseQuery(args, api, extraOptions)
    } else if (refreshed.unauthorized) {
      api.dispatch(clearCredentials())
      clearSessionCookie()
    }
  }

  return result
}

export type BootstrapRefreshResult =
  | { status: 'ok'; data: AuthTokensResponse }
  | { status: 'unauthorized' }
  | { status: 'failed' }

/** Used by AuthBootstrap — same mutex as 401 reauth. */
export async function bootstrapRefreshSession(): Promise<BootstrapRefreshResult> {
  return refreshSessionOnce(async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.status === 401) return { status: 'unauthorized' }
      if (!res.ok) return { status: 'failed' }
      const json = (await res.json()) as { data: AuthTokensResponse }
      return { status: 'ok', data: json.data }
    } catch {
      return { status: 'failed' }
    }
  })
}
