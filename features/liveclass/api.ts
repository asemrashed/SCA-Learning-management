import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'
import type {
  AttendanceSummary,
  CreateLiveClassScheduleInput,
  CreateRecordingInput,
  CreateSessionInput,
  LiveClassSchedule,
  LiveSession,
  MarkAttendanceInput,
  Recording,
  UpdateLiveClassScheduleInput,
  UpdateSessionInput,
} from '@/types/api'

export const liveclassApi = createApi({
  reducerPath: 'liveclassApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LiveSession', 'LiveClassSchedule', 'Recording', 'Attendance'],
  endpoints: (builder) => ({
    listBatchSessions: builder.query<{ data: LiveSession[] }, string>({
      query: (batchId) => `/batches/${batchId}/sessions`,
      providesTags: (_r, _e, batchId) => [{ type: 'LiveSession', id: `batch-${batchId}` }],
    }),
    listCourseSessions: builder.query<{ data: LiveSession[] }, string>({
      query: (courseId) => `/courses/${courseId}/sessions`,
      providesTags: (_r, _e, courseId) => [{ type: 'LiveSession', id: `course-${courseId}` }],
    }),
    listBatchLiveClassSchedules: builder.query<{ data: LiveClassSchedule[] }, string>({
      query: (batchId) => `/batches/${batchId}/live-classes`,
      providesTags: (_r, _e, batchId) => [
        { type: 'LiveClassSchedule', id: `batch-${batchId}` },
      ],
    }),
    listCourseLiveClassSchedules: builder.query<{ data: LiveClassSchedule[] }, string>({
      query: (courseId) => `/courses/${courseId}/live-classes`,
      providesTags: (_r, _e, courseId) => [
        { type: 'LiveClassSchedule', id: `course-${courseId}` },
      ],
    }),
    createLiveClassSchedule: builder.mutation<
      { data: LiveClassSchedule },
      CreateLiveClassScheduleInput
    >({
      query: (body) => ({ url: '/live-classes', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'LiveClassSchedule', id: `batch-${arg.batchId}` },
        { type: 'LiveSession', id: `batch-${arg.batchId}` },
      ],
    }),
    updateLiveClassSchedule: builder.mutation<
      { data: LiveClassSchedule },
      { id: string; body: UpdateLiveClassScheduleInput; scopeKey: string }
    >({
      query: ({ id, body }) => ({ url: `/live-classes/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'LiveClassSchedule', id: arg.scopeKey },
        { type: 'LiveSession', id: arg.scopeKey },
      ],
    }),
    deleteLiveClassSchedule: builder.mutation<void, { id: string; scopeKey: string }>({
      query: ({ id }) => ({ url: `/live-classes/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'LiveClassSchedule', id: arg.scopeKey },
        { type: 'LiveSession', id: arg.scopeKey },
      ],
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
      invalidatesTags: (_r, _e, arg) => [
        { type: 'LiveSession', id: arg.scopeKey },
        { type: 'LiveClassSchedule', id: arg.scopeKey },
      ],
    }),
    deleteSession: builder.mutation<void, { id: string; scopeKey: string }>({
      query: ({ id }) => ({ url: `/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'LiveSession', id: arg.scopeKey },
        { type: 'LiveClassSchedule', id: arg.scopeKey },
      ],
    }),
    listBatchRecordings: builder.query<
      { data: Recording[] },
      string | { batchId: string; scope?: 'own' | 'granted' }
    >({
      query: (arg) => {
        const batchId = typeof arg === 'string' ? arg : arg.batchId
        const scope = typeof arg === 'string' ? undefined : arg.scope
        return {
          url: `/batches/${batchId}/recordings`,
          params: scope ? { scope } : undefined,
        }
      },
      providesTags: (_r, _e, arg) => {
        const batchId = typeof arg === 'string' ? arg : arg.batchId
        const scope = typeof arg === 'string' ? 'own' : (arg.scope ?? 'own')
        return [{ type: 'Recording', id: `batch-${batchId}-${scope}` }]
      },
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
  useListBatchLiveClassSchedulesQuery,
  useListCourseLiveClassSchedulesQuery,
  useCreateLiveClassScheduleMutation,
  useUpdateLiveClassScheduleMutation,
  useDeleteLiveClassScheduleMutation,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useListBatchRecordingsQuery,
  useListCourseRecordingsQuery,
  useCreateRecordingMutation,
  useMarkAttendanceMutation,
  useGetMyAttendanceQuery,
} = liveclassApi
