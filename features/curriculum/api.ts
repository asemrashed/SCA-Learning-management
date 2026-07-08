import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'
import type { CascadeDeletePreview } from '@/components/cascade-delete-dialog'

export type CascadeDeletePreviewParams = {
  courseId?: string
  batchId?: string
  subjectId?: string
  moduleId?: string
}

export const curriculumApi = createApi({
  reducerPath: 'curriculumApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Curriculum'],
  endpoints: (builder) => ({
    getCascadeDeletePreview: builder.query<
      { data: CascadeDeletePreview },
      CascadeDeletePreviewParams
    >({
      query: (params) => ({
        url: '/curriculum/delete-preview',
        params,
      }),
    }),
    cascadeDeleteSubject: builder.mutation<
      {
        data: {
          deletedResources: number
          deletedSubjects?: number
          deletedModules?: number
          deletedLessons?: number
        }
      },
      string
    >({
      query: (subjectId) => ({
        url: `/curriculum/subjects/${subjectId}`,
        method: 'DELETE',
        body: { confirm: 'DELETE' },
      }),
      invalidatesTags: ['Curriculum'],
    }),
    cascadeDeleteModule: builder.mutation<
      {
        data: {
          deletedResources: number
          deletedModules?: number
          deletedLessons?: number
        }
      },
      string
    >({
      query: (moduleId) => ({
        url: `/curriculum/modules/${moduleId}`,
        method: 'DELETE',
        body: { confirm: 'DELETE' },
      }),
      invalidatesTags: ['Curriculum'],
    }),
  }),
})

export const {
  useLazyGetCascadeDeletePreviewQuery,
  useCascadeDeleteSubjectMutation,
  useCascadeDeleteModuleMutation,
} = curriculumApi
