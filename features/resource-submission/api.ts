import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  ListResourceSubmissionsParams,
  ResourceSubmissionRecord,
  ReviewResourceSubmissionInput,
  StudentAssessmentResult,
  UploadResourceSubmissionResultInput,
} from '@/types/api'
import { ResourceCategory } from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

interface SubmitResourceResponse {
  submission: ResourceSubmissionRecord
  whatsappUrl: string
}

export const resourceSubmissionApi = createApi({
  reducerPath: 'resourceSubmissionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ResourceSubmission', 'StudentAssessmentResult'],
  endpoints: (builder) => ({
    submitResource: builder.mutation<
      { data: SubmitResourceResponse },
      { enrollmentId: string; resourceId: string }
    >({
      query: ({ enrollmentId, resourceId }) => ({
        url: `/me/enrollments/${enrollmentId}/resources/${resourceId}/submissions`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'ResourceSubmission', id: 'LIST' },
        { type: 'ResourceSubmission', id: 'ADMIN_LIST' },
      ],
    }),
    listEnrollmentSubmissions: builder.query<
      { data: ResourceSubmissionRecord[] },
      { enrollmentId: string; category: ResourceCategory.EXAM | ResourceCategory.ASSIGNMENT }
    >({
      query: ({ enrollmentId, category }) =>
        `/me/enrollments/${enrollmentId}/submissions/${category}`,
      providesTags: [{ type: 'ResourceSubmission', id: 'LIST' }],
    }),
    listStudentAssessmentResults: builder.query<
      { data: StudentAssessmentResult[] },
      string
    >({
      query: (enrollmentId) => `/me/enrollments/${enrollmentId}/assessment-results`,
      providesTags: [{ type: 'StudentAssessmentResult', id: 'LIST' }],
    }),
    listAdminResourceSubmissions: builder.query<
      { data: ResourceSubmissionRecord[]; meta: { page: number; pageSize: number; total: number } },
      ListResourceSubmissionsParams
    >({
      query: (params) => ({
        url: '/admin/resource-submissions',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'ResourceSubmission' as const, id })),
              { type: 'ResourceSubmission', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'ResourceSubmission', id: 'ADMIN_LIST' }],
    }),
    reviewResourceSubmission: builder.mutation<
      { data: ResourceSubmissionRecord },
      { id: string; body: ReviewResourceSubmissionInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/resource-submissions/${id}/review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'ResourceSubmission', id: 'ADMIN_LIST' },
        { type: 'StudentAssessmentResult', id: 'LIST' },
      ],
    }),
    uploadResourceSubmissionResult: builder.mutation<
      { data: ResourceSubmissionRecord },
      { id: string; body: UploadResourceSubmissionResultInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/resource-submissions/${id}/result`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'ResourceSubmission', id: 'ADMIN_LIST' },
        { type: 'StudentAssessmentResult', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useSubmitResourceMutation,
  useListEnrollmentSubmissionsQuery,
  useListStudentAssessmentResultsQuery,
  useListAdminResourceSubmissionsQuery,
  useReviewResourceSubmissionMutation,
  useUploadResourceSubmissionResultMutation,
} = resourceSubmissionApi
