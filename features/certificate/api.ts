import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  CertificateItem,
  CertificateVerifyResult,
  IssueCertificateInput,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const certificateApi = createApi({
  reducerPath: 'certificateApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Certificate'],
  endpoints: (builder) => ({
    listMyCertificates: builder.query<{ data: CertificateItem[] }, void>({
      query: () => '/me/certificates',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Certificate' as const, id })),
              { type: 'Certificate', id: 'LIST' },
            ]
          : [{ type: 'Certificate', id: 'LIST' }],
    }),
    issueCertificate: builder.mutation<{ data: CertificateItem }, IssueCertificateInput>({
      query: (body) => ({ url: '/certificates/issue', method: 'POST', body }),
      invalidatesTags: [{ type: 'Certificate', id: 'LIST' }],
    }),
    verifyCertificate: builder.query<{ data: CertificateVerifyResult }, string>({
      query: (serial) => `/certificates/verify/${encodeURIComponent(serial)}`,
    }),
  }),
})

export const {
  useListMyCertificatesQuery,
  useIssueCertificateMutation,
  useVerifyCertificateQuery,
} = certificateApi
