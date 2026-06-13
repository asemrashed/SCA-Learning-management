import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  CreateResourceInput,
  ResourceItem,
  ResourceListQuery,
  ResourceListResponse,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const resourceApi = createApi({
  reducerPath: 'resourceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Resource'],
  endpoints: (builder) => ({
    listResources: builder.query<ResourceListResponse, ResourceListQuery>({
      query: (params) => ({
        url: '/resources',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Resource' as const, id })),
              { type: 'Resource', id: 'LIST' },
            ]
          : [{ type: 'Resource', id: 'LIST' }],
    }),
    createResource: builder.mutation<{ data: ResourceItem }, CreateResourceInput>({
      query: (body) => ({ url: '/resources', method: 'POST', body }),
      invalidatesTags: [{ type: 'Resource', id: 'LIST' }],
    }),
  }),
})

export const {
  useListResourcesQuery,
  useLazyListResourcesQuery,
  useCreateResourceMutation,
} = resourceApi
