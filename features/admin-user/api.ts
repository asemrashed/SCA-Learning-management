import { createApi } from '@reduxjs/toolkit/query/react'
import type { Role, User, PaginationMeta } from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export interface AdminUserListItem extends User {
  isActive: boolean
}

export interface AdminUserListResponse {
  data: AdminUserListItem[]
  meta: PaginationMeta
}

export interface CreateAdminUserInput {
  name: string
  phone: string
  password: string
  email?: string | null
  role: Role.ADMIN | Role.STUDENT
}

export interface UpdateAdminUserInput {
  name?: string
  email?: string | null
  role?: Role.ADMIN | Role.STUDENT
  isActive?: boolean
}

export const adminUserApi = createApi({
  reducerPath: 'adminUserApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminUserList'],
  endpoints: (builder) => ({
    listAdminUsers: builder.query<
      AdminUserListResponse,
      { page?: number; pageSize?: number; search?: string; role?: Role }
    >({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: [{ type: 'AdminUserList', id: 'LIST' }],
    }),
    createAdminUser: builder.mutation<{ data: AdminUserListItem }, CreateAdminUserInput>({
      query: (body) => ({
        url: '/admin/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminUserList', id: 'LIST' }],
    }),
    updateAdminUser: builder.mutation<
      { data: AdminUserListItem },
      { id: string; body: UpdateAdminUserInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'AdminUserList', id: 'LIST' }],
    }),
  }),
})

export const {
  useListAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
} = adminUserApi
