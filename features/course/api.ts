import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  CourseDetail,
  CourseListResponse,
  CreateCourseInput,
  UpdateCourseInput,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export interface CourseListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
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
      providesTags: (_result, _error, idOrSlug) => [{ type: 'Course', id: idOrSlug }],
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
  }),
})

export const {
  useListCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi
