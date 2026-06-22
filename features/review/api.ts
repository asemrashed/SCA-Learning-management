import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  CreateReviewInput,
  ListAdminReviewsParams,
  ModerateReviewInput,
  ReviewAdminItem,
  ReviewPublicItem,
  ReviewStudentItem,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Review', 'ReviewList', 'ReviewAdmin'],
  endpoints: (builder) => ({
    listPublicReviews: builder.query<
      { data: ReviewPublicItem[]; meta: { page: number; pageSize: number; total: number } },
      { courseId?: string; page?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: '/reviews',
        params: params ?? {},
      }),
      providesTags: [{ type: 'ReviewList', id: 'PUBLIC' }],
    }),
    listMyReviews: builder.query<{ data: ReviewStudentItem[] }, void>({
      query: () => '/me/reviews',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Review' as const, id })),
              { type: 'ReviewList', id: 'MINE' },
            ]
          : [{ type: 'ReviewList', id: 'MINE' }],
    }),
    submitReview: builder.mutation<{ data: ReviewStudentItem }, CreateReviewInput>({
      query: (body) => ({ url: '/me/reviews', method: 'POST', body }),
      invalidatesTags: [
        { type: 'ReviewList', id: 'MINE' },
        { type: 'ReviewList', id: 'PUBLIC' },
        { type: 'ReviewAdmin', id: 'LIST' },
      ],
    }),
    listAdminReviews: builder.query<
      { data: ReviewAdminItem[]; meta: { page: number; pageSize: number; total: number } },
      ListAdminReviewsParams
    >({
      query: (params) => ({
        url: '/admin/reviews',
        params,
      }),
      providesTags: [{ type: 'ReviewAdmin', id: 'LIST' }],
    }),
    moderateReview: builder.mutation<
      { data: ReviewAdminItem },
      { id: string; body: ModerateReviewInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/reviews/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'ReviewAdmin', id: 'LIST' },
        { type: 'ReviewList', id: 'PUBLIC' },
      ],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'ReviewAdmin', id: 'LIST' },
        { type: 'ReviewList', id: 'PUBLIC' },
      ],
    }),
  }),
})

export const {
  useListPublicReviewsQuery,
  useListMyReviewsQuery,
  useSubmitReviewMutation,
  useListAdminReviewsQuery,
  useModerateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi
