import { createApi } from '@reduxjs/toolkit/query/react'
import type { AuthTokensResponse, User } from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    getMe: builder.query<{ data: User }, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    register: builder.mutation<
      { data: AuthTokensResponse },
      { name: string; phone: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    login: builder.mutation<{ data: AuthTokensResponse }, { phone: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    refresh: builder.mutation<{ data: AuthTokensResponse }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    logout: builder.mutation<{ data: { success: boolean } }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useGetMeQuery,
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi
