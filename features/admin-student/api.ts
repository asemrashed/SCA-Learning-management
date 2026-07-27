import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  AdminStudentBoundDevicesResponse,
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
  tagTypes: ['AdminStudentList', 'AdminStudentDevices'],
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
    listAdminStudentBoundDevices: builder.query<
      { data: AdminStudentBoundDevicesResponse },
      string
    >({
      query: (studentId) => `/admin/students/${studentId}/bound-devices`,
      providesTags: (_result, _err, studentId) => [
        { type: 'AdminStudentDevices', id: studentId },
      ],
    }),
    removeAdminStudentBoundDevice: builder.mutation<
      { data: { success: true } },
      { studentId: string; deviceId: string }
    >({
      query: ({ studentId, deviceId }) => ({
        url: `/admin/students/${studentId}/bound-devices/${deviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { studentId }) => [
        { type: 'AdminStudentDevices', id: studentId },
      ],
    }),
  }),
})

export const {
  useListAdminStudentsQuery,
  useLazyListAdminStudentsQuery,
  useCreateAdminStudentMutation,
  useUpdateAdminStudentMutation,
  useDeleteAdminStudentMutation,
  useSetAdminStudentEnrollmentBlockMutation,
  useListAdminStudentBoundDevicesQuery,
  useRemoveAdminStudentBoundDeviceMutation,
} = adminStudentApi
