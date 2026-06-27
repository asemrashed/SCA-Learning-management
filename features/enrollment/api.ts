import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  EnrollmentDetail,
  EnrollmentListItem,
  CreateEnrollmentInput,
  AdminEnrollmentRequest,
  AdminEnrollmentOverview,
  ListAdminEnrollmentsParams,
  ReviewEnrollmentInput,
  ManualEnrollmentInput,
  PaginationMeta,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const enrollmentApi = createApi({
  reducerPath: 'enrollmentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Enrollment', 'EnrollmentList'],
  endpoints: (builder) => ({
    listEnrollments: builder.query<{ data: EnrollmentListItem[] }, void>({
      query: () => '/me/enrollments',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Enrollment' as const, id })),
              { type: 'EnrollmentList', id: 'LIST' },
            ]
          : [{ type: 'EnrollmentList', id: 'LIST' }],
    }),
    getEnrollment: builder.query<{ data: EnrollmentDetail }, string>({
      query: (id) => `/me/enrollments/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Enrollment', id }],
    }),
    createEnrollment: builder.mutation<{ data: EnrollmentListItem }, CreateEnrollmentInput>({
      query: (body) => ({ url: '/enrollments', method: 'POST', body }),
      invalidatesTags: [{ type: 'EnrollmentList', id: 'LIST' }],
    }),
    listAdminEnrollmentRequests: builder.query<
      { data: AdminEnrollmentRequest[]; meta: PaginationMeta },
      ListAdminEnrollmentsParams | void
    >({
      query: (params) => ({
        url: '/admin/enrollments',
        params: params ?? {},
      }),
      providesTags: [{ type: 'EnrollmentList', id: 'ADMIN' }],
    }),
    getAdminEnrollmentOverview: builder.query<{ data: AdminEnrollmentOverview }, void>({
      query: () => '/admin/enrollments/overview',
      providesTags: [{ type: 'EnrollmentList', id: 'ADMIN_OVERVIEW' }],
    }),
    reviewEnrollmentRequest: builder.mutation<
      { data: AdminEnrollmentRequest },
      { id: string; body: ReviewEnrollmentInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/enrollments/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'EnrollmentList', id: 'ADMIN' },
        { type: 'EnrollmentList', id: 'ADMIN_OVERVIEW' },
        { type: 'EnrollmentList', id: 'LIST' },
      ],
    }),
    createManualEnrollment: builder.mutation<
      { data: AdminEnrollmentRequest },
      ManualEnrollmentInput
    >({
      query: (body) => ({
        url: '/admin/enrollments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'EnrollmentList', id: 'ADMIN' },
        { type: 'EnrollmentList', id: 'ADMIN_OVERVIEW' },
        { type: 'EnrollmentList', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useListEnrollmentsQuery,
  useGetEnrollmentQuery,
  useCreateEnrollmentMutation,
  useListAdminEnrollmentRequestsQuery,
  useGetAdminEnrollmentOverviewQuery,
  useReviewEnrollmentRequestMutation,
  useCreateManualEnrollmentMutation,
} = enrollmentApi
