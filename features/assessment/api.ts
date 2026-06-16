import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  AssignmentListItem,
  CreateAssignmentInput,
  CreateExamInput,
  CreateQuestionInput,
  CreateSubmissionInput,
  ExamAttempt,
  ExamDetail,
  ExamListItem,
  GradeSubmissionInput,
  Question,
  QuestionListResponse,
  Submission,
  UpdateAttemptInput,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export interface QuestionListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  type?: string
}

export const assessmentApi = createApi({
  reducerPath: 'assessmentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Question', 'Exam', 'Attempt', 'Assignment', 'Submission'],
  endpoints: (builder) => ({
    listQuestions: builder.query<QuestionListResponse, QuestionListParams | void>({
      query: (params) => ({
        url: '/questions',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Question' as const, id })),
              { type: 'Question', id: 'LIST' },
            ]
          : [{ type: 'Question', id: 'LIST' }],
    }),
    createQuestion: builder.mutation<{ data: Question }, CreateQuestionInput>({
      query: (body) => ({ url: '/questions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),
    listBatchExams: builder.query<{ data: ExamListItem[] }, string>({
      query: (batchId) => `/batches/${batchId}/exams`,
      providesTags: (_r, _e, batchId) => [{ type: 'Exam', id: `batch-${batchId}` }],
    }),
    listCourseExams: builder.query<{ data: ExamListItem[] }, string>({
      query: (courseId) => `/courses/${courseId}/exams`,
      providesTags: (_r, _e, courseId) => [{ type: 'Exam', id: `course-${courseId}` }],
    }),
    createExam: builder.mutation<{ data: ExamDetail }, CreateExamInput>({
      query: (body) => ({ url: '/exams', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Exam', id: 'LIST' },
        { type: 'Exam', id: `course-${arg.courseId}` },
      ],
    }),
    startExamAttempt: builder.mutation<{ data: ExamAttempt }, string>({
      query: (examId) => ({ url: `/exams/${examId}/attempts`, method: 'POST' }),
      invalidatesTags: [{ type: 'Attempt', id: 'LIST' }],
    }),
    updateExamAttempt: builder.mutation<
      { data: ExamAttempt },
      { id: string; body: UpdateAttemptInput }
    >({
      query: ({ id, body }) => ({ url: `/attempts/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Attempt', id }],
    }),
    listBatchAssignments: builder.query<{ data: AssignmentListItem[] }, string>({
      query: (batchId) => `/batches/${batchId}/assignments`,
      providesTags: (_r, _e, batchId) => [{ type: 'Assignment', id: `batch-${batchId}` }],
    }),
    listCourseAssignments: builder.query<{ data: AssignmentListItem[] }, string>({
      query: (courseId) => `/courses/${courseId}/assignments`,
      providesTags: (_r, _e, courseId) => [{ type: 'Assignment', id: `course-${courseId}` }],
    }),
    createAssignment: builder.mutation<{ data: AssignmentListItem }, CreateAssignmentInput>({
      query: (body) => ({ url: '/assignments', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Assignment', id: 'LIST' },
        { type: 'Assignment', id: `course-${arg.courseId}` },
      ],
    }),
    submitAssignment: builder.mutation<
      { data: Submission },
      { assignmentId: string; body: CreateSubmissionInput }
    >({
      query: ({ assignmentId, body }) => ({
        url: `/assignments/${assignmentId}/submissions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }],
    }),
    gradeSubmission: builder.mutation<
      { data: Submission },
      { id: string; body: GradeSubmissionInput }
    >({
      query: ({ id, body }) => ({
        url: `/submissions/${id}/grade`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Submission', id: 'LIST' }],
    }),
  }),
})

export const {
  useListQuestionsQuery,
  useCreateQuestionMutation,
  useListBatchExamsQuery,
  useListCourseExamsQuery,
  useLazyListBatchExamsQuery,
  useLazyListCourseExamsQuery,
  useCreateExamMutation,
  useStartExamAttemptMutation,
  useUpdateExamAttemptMutation,
  useListBatchAssignmentsQuery,
  useListCourseAssignmentsQuery,
  useLazyListBatchAssignmentsQuery,
  useLazyListCourseAssignmentsQuery,
  useCreateAssignmentMutation,
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
} = assessmentApi
