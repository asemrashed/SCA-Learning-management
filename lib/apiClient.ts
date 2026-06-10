import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store/rootReducer'
import type { AuthTokensResponse } from '@/types/api'
import { clearSessionCookie } from '@/lib/auth-session'
import { clearCredentials, setCredentials } from '@/features/auth/authSlice'

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  const requestUrl = typeof args === 'string' ? args : args.url
  const skipReauth =
    requestUrl.includes('/auth/login') ||
    requestUrl.includes('/auth/register') ||
    requestUrl.includes('/auth/refresh')

  if (result.error?.status === 401 && !skipReauth) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      const payload = refreshResult.data as { data: AuthTokensResponse }
      api.dispatch(
        setCredentials({
          accessToken: payload.data.accessToken,
          user: payload.data.user,
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
