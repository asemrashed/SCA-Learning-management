import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  AdminStudentListItem,
  CreateAdminStudentInput,
  ListAdminStudentsParams,
  PaginationMeta,
  UpdateAdminStudentInput,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const adminStudentApi = createApi({
  reducerPath: 'adminStudentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminStudentList'],
  endpoints: (builder) => ({
    listAdminStudents: builder.query<
      { data: AdminStudentListItem[]; meta: PaginationMeta },
      ListAdminStudentsParams | void
    >({
      query: (params) => ({
        url: '/admin/students',
        params: params ?? {},
      }),
      providesTags: [{ type: 'AdminStudentList', id: 'LIST' }],
    }),
    createAdminStudent: builder.mutation<
      {
        data: {
          id: string
          name: string
          phone: string
          email: string | null
          isActive: boolean
        }
      },
      CreateAdminStudentInput
    >({
      query: (body) => ({
        url: '/admin/students',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminStudentList', id: 'LIST' }],
    }),
    updateAdminStudent: builder.mutation<
      {
        data: {
          id: string
          name: string
          phone: string
          email: string | null
          avatarUrl: string | null
          isActive: boolean
        }
      },
      { id: string; body: UpdateAdminStudentInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/students/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'AdminStudentList', id: 'LIST' }],
    }),
    deleteAdminStudent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminStudentList', id: 'LIST' }],
    }),
    setAdminStudentEnrollmentBlock: builder.mutation<
      { data: AdminStudentListItem },
      { enrollmentId: string; blocked: boolean }
    >({
      query: ({ enrollmentId, blocked }) => ({
        url: `/admin/students/enrollments/${enrollmentId}/block`,
        method: 'PATCH',
        body: { blocked },
      }),
      invalidatesTags: [{ type: 'AdminStudentList', id: 'LIST' }],
    }),
  }),
})

export const {
  useListAdminStudentsQuery,
  useCreateAdminStudentMutation,
  useUpdateAdminStudentMutation,
  useDeleteAdminStudentMutation,
  useSetAdminStudentEnrollmentBlockMutation,
} = adminStudentApi
