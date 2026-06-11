import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  EnrollmentDetail,
  EnrollmentListItem,
  CreateEnrollmentInput,
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
    markLessonComplete: builder.mutation<{ data: { progressPct: number } }, string>({
      query: (lessonId) => ({
        url: `/me/lessons/${lessonId}/progress`,
        method: 'PATCH',
        body: { completed: true },
      }),
      invalidatesTags: [{ type: 'EnrollmentList', id: 'LIST' }],
    }),
  }),
})

export const {
  useListEnrollmentsQuery,
  useGetEnrollmentQuery,
  useCreateEnrollmentMutation,
  useMarkLessonCompleteMutation,
} = enrollmentApi
