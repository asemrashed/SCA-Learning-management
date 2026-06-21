import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'
import type {
  BatchContentGrant,
  BatchDetail,
  BatchListItem,
  BatchListParams,
  CreateBatchBodyInput,
  PaginationMeta,
  UpdateBatchInput,
} from './types'
import type { CourseSubject } from '@/types/api'

export const batchApi = createApi({
  reducerPath: 'batchApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Batch', 'BatchList', 'BatchGrant', 'BatchCurriculum'],
  endpoints: (builder) => ({
    listBatches: builder.query<{ data: BatchListItem[]; meta: PaginationMeta }, BatchListParams | void>({
      query: (params) => ({
        url: '/batches',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Batch' as const, id })),
              { type: 'BatchList', id: 'LIST' },
            ]
          : [{ type: 'BatchList', id: 'LIST' }],
    }),
    listBatchesByCourse: builder.query<{ data: BatchListItem[] }, string>({
      query: (courseId) => `/courses/${courseId}/batches`,
      providesTags: (result, _error, courseId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Batch' as const, id })),
              { type: 'BatchList', id: `COURSE_${courseId}` },
            ]
          : [{ type: 'BatchList', id: `COURSE_${courseId}` }],
    }),
    getBatch: builder.query<{ data: BatchDetail }, string>({
      query: (idOrSlug) => `/batches/${idOrSlug}`,
      providesTags: (result, _error, idOrSlug) => [
        { type: 'Batch', id: idOrSlug },
        ...(result ? [{ type: 'Batch' as const, id: result.data.id }] : []),
      ],
      keepUnusedDataFor: 0,
    }),
    createBatchUnderCourse: builder.mutation<
      { data: BatchDetail },
      { courseId: string; body: CreateBatchBodyInput }
    >({
      query: ({ courseId, body }) => ({
        url: `/courses/${courseId}/batches`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'BatchList', id: 'LIST' },
        { type: 'BatchList', id: `COURSE_${courseId}` },
      ],
    }),
    updateBatch: builder.mutation<
      { data: BatchDetail },
      { id: string; body: UpdateBatchInput }
    >({
      query: ({ id, body }) => ({
        url: `/batches/${id}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled
          dispatch(
            batchApi.util.updateQueryData('getBatch', id, () => result),
          )
        } catch {
          /* invalidation below handles failed saves */
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Batch', id },
        { type: 'BatchList', id: 'LIST' },
      ],
    }),
    deleteBatch: builder.mutation<{ data: { success: boolean } }, string>({
      query: (id) => ({
        url: `/batches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'BatchList', id: 'LIST' }],
    }),
    listContentGrants: builder.query<{ data: BatchContentGrant[] }, string>({
      query: (batchId) => `/batches/${batchId}/content-grants`,
      providesTags: (_result, _error, batchId) => [{ type: 'BatchGrant', id: batchId }],
    }),
    createContentGrant: builder.mutation<
      { data: BatchContentGrant },
      { batchId: string; grantingBatchId: string }
    >({
      query: ({ batchId, grantingBatchId }) => ({
        url: `/batches/${batchId}/content-grants`,
        method: 'POST',
        body: { grantingBatchId },
      }),
      invalidatesTags: (_result, _error, { batchId }) => [{ type: 'BatchGrant', id: batchId }],
    }),
    deleteContentGrant: builder.mutation<
      { data: { success: boolean } },
      { batchId: string; grantId: string }
    >({
      query: ({ batchId, grantId }) => ({
        url: `/batches/${batchId}/content-grants/${grantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { batchId }) => [{ type: 'BatchGrant', id: batchId }],
    }),
    getBatchCurriculum: builder.query<{ data: CourseSubject[] }, string>({
      query: (batchId) => `/batches/${batchId}/curriculum`,
      providesTags: (_result, _error, batchId) => [{ type: 'BatchCurriculum', id: batchId }],
    }),
  }),
})

export const {
  useListBatchesQuery,
  useListBatchesByCourseQuery,
  useGetBatchQuery,
  useCreateBatchUnderCourseMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useListContentGrantsQuery,
  useCreateContentGrantMutation,
  useDeleteContentGrantMutation,
  useGetBatchCurriculumQuery,
  useLazyGetBatchCurriculumQuery,
} = batchApi

/** @deprecated use useCreateBatchUnderCourseMutation */
export const useCreateBatchMutation = useCreateBatchUnderCourseMutation
