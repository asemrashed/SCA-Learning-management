import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  CategoryDetail,
  CategoryListResponse,
  CreateCategoryInput,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Category', 'CategoryList'],
  endpoints: (builder) => ({
    listCategories: builder.query<
      CategoryListResponse,
      { page?: number; pageSize?: number; search?: string; sort?: string }
    >({
      query: (params) => ({ url: '/categories', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'CategoryList', id: 'LIST' },
            ]
          : [{ type: 'CategoryList', id: 'LIST' }],
    }),
    getCategory: builder.query<{ data: CategoryDetail }, string>({
      query: (idOrSlug) => `/categories/${idOrSlug}`,
      providesTags: (_r, _e, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation<{ data: CategoryDetail }, CreateCategoryInput>({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: [{ type: 'CategoryList', id: 'LIST' }],
    }),
    updateCategory: builder.mutation<
      { data: CategoryDetail },
      { id: string; body: Partial<CreateCategoryInput> }
    >({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Category', id },
        { type: 'CategoryList', id: 'LIST' },
      ],
    }),
    deleteCategory: builder.mutation<{ data: { success: boolean } }, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'CategoryList', id: 'LIST' }],
    }),
  }),
})

export const {
  useListCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi
