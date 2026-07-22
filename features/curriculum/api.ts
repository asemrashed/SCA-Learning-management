import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'
import type { CascadeDeletePreview } from '@/components/cascade-delete-dialog'
import type { LessonType } from '@/types/api'

export type CascadeDeletePreviewParams = {
  courseId?: string
  batchId?: string
  subjectId?: string
  moduleId?: string
  lessonId?: string
}

export type CurriculumLessonPayload = {
  id?: string
  title: string
  type: LessonType
  order: number
  isPreview: boolean
  videoUrl?: string | null
  content?: string | null
  durationS?: number | null
  lectureDate?: string
}

export type UpdateModulePayload = {
  title?: string
  order?: number
  lessons?: CurriculumLessonPayload[]
}

export const curriculumApi = createApi({
  reducerPath: 'curriculumApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Curriculum', 'BatchCurriculum', 'Course'],
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
      invalidatesTags: ['Curriculum', 'BatchCurriculum'],
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
      invalidatesTags: ['Curriculum', 'BatchCurriculum', 'Course'],
    }),
    cascadeDeleteLesson: builder.mutation<
      {
        data: {
          deletedResources: number
          deletedLessons?: number
        }
      },
      string
    >({
      query: (lessonId) => ({
        url: `/curriculum/lessons/${lessonId}`,
        method: 'DELETE',
        body: { confirm: 'DELETE' },
      }),
      invalidatesTags: ['Curriculum', 'BatchCurriculum', 'Course'],
    }),
    createBatchSubject: builder.mutation<
      { data: { id: string; title: string; order: number } },
      { batchId: string; body: { title: string; order?: number } }
    >({
      query: ({ batchId, body }) => ({
        url: `/batches/${batchId}/subjects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { batchId }) => [{ type: 'BatchCurriculum', id: batchId }],
    }),
    updateBatchSubject: builder.mutation<
      { data: { id: string; title: string; order: number } },
      { batchId: string; subjectId: string; body: { title?: string; order?: number } }
    >({
      query: ({ batchId, subjectId, body }) => ({
        url: `/batches/${batchId}/subjects/${subjectId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { batchId }) => [{ type: 'BatchCurriculum', id: batchId }],
    }),
    createBatchModule: builder.mutation<
      { data: { id: string; title: string; order: number } },
      { batchId: string; subjectId: string; body: { title: string; order?: number } }
    >({
      query: ({ batchId, subjectId, body }) => ({
        url: `/batches/${batchId}/subjects/${subjectId}/modules`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { batchId }) => [{ type: 'BatchCurriculum', id: batchId }],
    }),
    updateBatchModule: builder.mutation<
      { data: { success: boolean } },
      { batchId: string; moduleId: string; body: UpdateModulePayload }
    >({
      query: ({ batchId, moduleId, body }) => ({
        url: `/batches/${batchId}/modules/${moduleId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { batchId }) => [{ type: 'BatchCurriculum', id: batchId }],
    }),
    createCourseModule: builder.mutation<
      { data: { id: string; title: string; order: number } },
      { courseId: string; body: { title: string; order?: number } }
    >({
      query: ({ courseId, body }) => ({
        url: `/courses/${courseId}/modules`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { courseId }) => [{ type: 'Course', id: courseId }],
    }),
    updateCourseModule: builder.mutation<
      { data: { success: boolean } },
      { courseId: string; moduleId: string; body: UpdateModulePayload }
    >({
      query: ({ courseId, moduleId, body }) => ({
        url: `/courses/${courseId}/modules/${moduleId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { courseId }) => [{ type: 'Course', id: courseId }],
    }),
  }),
})

export const {
  useLazyGetCascadeDeletePreviewQuery,
  useCascadeDeleteSubjectMutation,
  useCascadeDeleteModuleMutation,
  useCascadeDeleteLessonMutation,
  useCreateBatchSubjectMutation,
  useUpdateBatchSubjectMutation,
  useCreateBatchModuleMutation,
  useUpdateBatchModuleMutation,
  useCreateCourseModuleMutation,
  useUpdateCourseModuleMutation,
} = curriculumApi
