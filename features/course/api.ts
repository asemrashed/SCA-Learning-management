import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  ApplyBatchCurriculumInput,
  CourseDetail,
  CourseInputSubject,
  CourseListResponse,
  CreateCourseInput,
  DeliveryMode,
  UpdateCourseInput,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export interface CourseListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  deliveryMode?: DeliveryMode
  sort?: string
}

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Course', 'CourseList'],
  endpoints: (builder) => ({
    listCourses: builder.query<CourseListResponse, CourseListParams | void>({
      query: (params) => ({
        url: '/courses',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Course' as const, id })),
              { type: 'CourseList', id: 'LIST' },
            ]
          : [{ type: 'CourseList', id: 'LIST' }],
    }),
    getCourse: builder.query<{ data: CourseDetail }, string>({
      query: (idOrSlug) => `/courses/${idOrSlug}`,
      providesTags: (result, _error, idOrSlug) => [
        { type: 'Course', id: idOrSlug },
        ...(result ? [{ type: 'Course' as const, id: result.data.id }] : []),
      ],
      keepUnusedDataFor: 0,
    }),
    createCourse: builder.mutation<{ data: CourseDetail }, CreateCourseInput>({
      query: (body) => ({
        url: '/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CourseList', id: 'LIST' }],
    }),
    updateCourse: builder.mutation<
      { data: CourseDetail },
      { id: string; body: UpdateCourseInput }
    >({
      query: ({ id, body }) => ({
        url: `/courses/${id}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: result } = await queryFulfilled
          dispatch(
            courseApi.util.updateQueryData('getCourse', id, () => result),
          )
        } catch {
          /* invalidation below handles failed saves */
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Course', id },
        { type: 'CourseList', id: 'LIST' },
      ],
    }),
    deleteCourse: builder.mutation<{ data: { success: boolean } }, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'CourseList', id: 'LIST' }],
    }),
    applyBatchCurriculum: builder.mutation<
      { data: { success: boolean } },
      { courseId: string; body: ApplyBatchCurriculumInput }
    >({
      query: ({ courseId, body }) => ({
        url: `/courses/${courseId}/batch-curriculum`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Course', id: courseId },
      ],
    }),
  }),
})

export const {
  useListCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useApplyBatchCurriculumMutation,
} = courseApi

export type { CourseInputSubject }
