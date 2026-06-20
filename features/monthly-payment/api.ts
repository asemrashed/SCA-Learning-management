import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  EnrollmentPaymentHistory,
  ListMonthlyPaymentsParams,
  MonthlyPaymentRecord,
  ReviewMonthlyPaymentInput,
  UnpaidStudentRecord,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const monthlyPaymentApi = createApi({
  reducerPath: 'monthlyPaymentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MonthlyPayment', 'EnrollmentPaymentHistory'],
  endpoints: (builder) => ({
    getEnrollmentPaymentHistory: builder.query<
      { data: EnrollmentPaymentHistory },
      string
    >({
      query: (enrollmentId) => `/me/enrollments/${enrollmentId}/payment-history`,
      providesTags: (_r, _e, enrollmentId) => [
        { type: 'EnrollmentPaymentHistory', id: enrollmentId },
      ],
    }),
    requestMonthlyPayment: builder.mutation<
      { data: { payment: MonthlyPaymentRecord; whatsappUrl: string } },
      string
    >({
      query: (enrollmentId) => ({
        url: `/me/enrollments/${enrollmentId}/monthly-payments`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, enrollmentId) => [
        { type: 'EnrollmentPaymentHistory', id: enrollmentId },
        { type: 'MonthlyPayment', id: 'LIST' },
      ],
    }),
    listAdminMonthlyPayments: builder.query<
      { data: MonthlyPaymentRecord[]; meta: { total: number; page: number; pageSize: number } },
      ListMonthlyPaymentsParams | void
    >({
      query: (params) => ({
        url: '/admin/monthly-payments',
        params: params ?? {},
      }),
      providesTags: [{ type: 'MonthlyPayment', id: 'LIST' }],
    }),
    listUnpaidStudents: builder.query<
      { data: UnpaidStudentRecord[]; meta: { total: number; page: number; pageSize: number } },
      ListMonthlyPaymentsParams | void
    >({
      query: (params) => ({
        url: '/admin/monthly-payments/unpaid-students',
        params: params ?? {},
      }),
      providesTags: [{ type: 'MonthlyPayment', id: 'UNPAID' }],
    }),
    reviewMonthlyPayment: builder.mutation<
      { data: MonthlyPaymentRecord },
      { id: string; body: ReviewMonthlyPaymentInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/monthly-payments/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result) => [
        { type: 'MonthlyPayment', id: 'LIST' },
        { type: 'MonthlyPayment', id: 'UNPAID' },
        { type: 'MonthlyPayment', id: 'INSTRUCTOR' },
        ...(result
          ? [{ type: 'EnrollmentPaymentHistory' as const, id: result.data.enrollment.id }]
          : []),
      ],
    }),
    listInstructorMonthlyPayments: builder.query<
      { data: MonthlyPaymentRecord[]; meta: { total: number; page: number; pageSize: number } },
      ListMonthlyPaymentsParams | void
    >({
      query: (params) => ({
        url: '/instructor/monthly-payments',
        params: params ?? {},
      }),
      providesTags: [{ type: 'MonthlyPayment', id: 'INSTRUCTOR' }],
    }),
  }),
})

export const {
  useGetEnrollmentPaymentHistoryQuery,
  useRequestMonthlyPaymentMutation,
  useListAdminMonthlyPaymentsQuery,
  useListUnpaidStudentsQuery,
  useReviewMonthlyPaymentMutation,
  useListInstructorMonthlyPaymentsQuery,
} = monthlyPaymentApi
