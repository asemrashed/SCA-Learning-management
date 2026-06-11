import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'
import type {
  BatchDetail,
  BatchListItem,
  BatchListParams,
  CreateBatchInput,
  PaginationMeta,
  UpdateBatchInput,
} from './types'

export const batchApi = createApi({
  reducerPath: 'batchApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Batch', 'BatchList'],
  endpoints: (builder) => ({
    listBatches: builder.query<{ data: BatchListItem[]; meta: PaginationMeta }, BatchListParams | void>({
      query: (params) => ({
        url: '/batches',
        params: params ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Batch' as const, id })),
              { type: 'BatchList', id: 'LIST' },
            ]
          : [{ type: 'BatchList', id: 'LIST' }],
    }),
    getBatch: builder.query<{ data: BatchDetail }, string>({
      query: (idOrSlug) => `/batches/${idOrSlug}`,
      providesTags: (_result, _error, idOrSlug) => [{ type: 'Batch', id: idOrSlug }],
    }),
    createBatch: builder.mutation<{ data: BatchDetail }, CreateBatchInput>({
      query: (body) => ({
        url: '/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BatchList', id: 'LIST' }],
    }),
    updateBatch: builder.mutation<
      { data: BatchDetail },
      { id: string; body: UpdateBatchInput }
    >({
      query: ({ id, body }) => ({
        url: `/batches/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Batch', id },
        { type: 'BatchList', id: 'LIST' },
      ],
    }),
    deleteBatch: builder.mutation<{ data: { success: boolean } }, string>({
      query: (id) => ({
        url: `/batches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'BatchList', id: 'LIST' }],
    }),
  }),
})

export const {
  useListBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} = batchApi
