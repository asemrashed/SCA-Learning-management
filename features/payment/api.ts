import { createApi } from '@reduxjs/toolkit/query/react'
import type { InitiatePaymentInput, PaymentRecord } from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<
      { data: { paymentId: string; redirectUrl: string } },
      InitiatePaymentInput
    >({
      query: (body) => ({ url: '/payments/initiate', method: 'POST', body }),
    }),
    getPayment: builder.query<{ data: PaymentRecord }, string>({
      query: (id) => `/me/payments/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Payment', id }],
    }),
  }),
})

export const { useInitiatePaymentMutation, useGetPaymentQuery, useLazyGetPaymentQuery } =
  paymentApi
