import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'
import type {
  AttendanceSummary,
  CreateRecordingInput,
  CreateSessionInput,
  LiveSession,
  MarkAttendanceInput,
  Recording,
  UpdateSessionInput,
} from '@/types/api'

export const liveclassApi = createApi({
  reducerPath: 'liveclassApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LiveSession', 'Recording', 'Attendance'],
  endpoints: (builder) => ({
    listBatchSessions: builder.query<{ data: LiveSession[] }, string>({
      query: (batchId) => `/batches/${batchId}/sessions`,
      providesTags: (_r, _e, batchId) => [{ type: 'LiveSession', id: `batch-${batchId}` }],
    }),
    listCourseSessions: builder.query<{ data: LiveSession[] }, string>({
      query: (courseId) => `/courses/${courseId}/sessions`,
      providesTags: (_r, _e, courseId) => [{ type: 'LiveSession', id: `course-${courseId}` }],
    }),
    createSession: builder.mutation<{ data: LiveSession }, CreateSessionInput>({
      query: (body) => ({ url: '/sessions', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'LiveSession', id: `batch-${arg.batchId}` },
      ],
    }),
    updateSession: builder.mutation<
      { data: LiveSession },
      { id: string; body: UpdateSessionInput; scopeKey: string }
    >({
      query: ({ id, body }) => ({ url: `/sessions/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'LiveSession', id: arg.scopeKey }],
    }),
    listBatchRecordings: builder.query<{ data: Recording[] }, string>({
      query: (batchId) => `/batches/${batchId}/recordings`,
      providesTags: (_r, _e, batchId) => [{ type: 'Recording', id: `batch-${batchId}` }],
    }),
    listCourseRecordings: builder.query<{ data: Recording[] }, string>({
      query: (courseId) => `/courses/${courseId}/recordings`,
      providesTags: (_r, _e, courseId) => [{ type: 'Recording', id: `course-${courseId}` }],
    }),
    createRecording: builder.mutation<{ data: Recording }, CreateRecordingInput>({
      query: (body) => ({ url: '/recordings', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => {
        const tags: { type: 'Recording' | 'LiveSession'; id: string }[] = [
          { type: 'Recording', id: `batch-${arg.batchId}` },
        ]
        if (arg.sessionId) tags.push({ type: 'LiveSession', id: arg.sessionId })
        return tags
      },
    }),
    markAttendance: builder.mutation<
      { data: { marked: number } },
      { sessionId: string; marks: MarkAttendanceInput[] }
    >({
      query: ({ sessionId, marks }) => ({
        url: `/sessions/${sessionId}/attendance`,
        method: 'POST',
        body: marks,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'ME' }],
    }),
    getMyAttendance: builder.query<{ data: AttendanceSummary[] }, void>({
      query: () => '/me/attendance',
      providesTags: [{ type: 'Attendance', id: 'ME' }],
    }),
  }),
})

export const {
  useListBatchSessionsQuery,
  useListCourseSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useListBatchRecordingsQuery,
  useListCourseRecordingsQuery,
  useCreateRecordingMutation,
  useMarkAttendanceMutation,
  useGetMyAttendanceQuery,
} = liveclassApi
