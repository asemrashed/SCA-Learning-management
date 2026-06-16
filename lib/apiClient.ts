import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store/rootReducer'
import type { AuthTokensResponse } from '@/types/api'
import { clearSessionCookie, hasSessionCookie } from '@/lib/auth-session'
import { refreshSessionOnce } from '@/lib/auth-refresh'
import { waitForAuthReady } from '@/lib/auth-ready'
import { clearCredentials, setCredentials } from '@/features/auth/authSlice'

const baseUrl = process.env.NEXT_PUBLIC_API_URL
if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not set')
}

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

async function tryRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<{ data: AuthTokensResponse } | null> {
  return refreshSessionOnce(async () => {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )
    if (refreshResult.data) {
      return refreshResult.data as { data: AuthTokensResponse }
    }
    return null
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

    if (refreshed) {
      api.dispatch(
        setCredentials({
          accessToken: refreshed.data.accessToken,
          user: refreshed.data.user,
        }),
      )
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(clearCredentials())
      clearSessionCookie()
    }
  }

  return result
}

/** Used by AuthBootstrap — same mutex as 401 reauth. */
export async function bootstrapRefreshSession(): Promise<{ data: AuthTokensResponse } | null> {
  return refreshSessionOnce(async () => {
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return null
    return (await res.json()) as { data: AuthTokensResponse }
  })
}
