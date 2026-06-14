import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  CreateOrderInput,
  CreateProductInput,
  OrderListItem,
  ProductDetail,
  ProductListResponse,
  ProductType,
  AdminOrderRequest,
  ReviewOrderInput,
  OrderStatus,
} from '@/types/api'
import { baseQueryWithReauth } from '@/lib/apiClient'

export const shopApi = createApi({
  reducerPath: 'shopApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'ProductList', 'Order', 'OrderList'],
  endpoints: (builder) => ({
    listProducts: builder.query<
      ProductListResponse,
      { page?: number; pageSize?: number; search?: string; type?: ProductType; sort?: string }
    >({
      query: (params) => ({ url: '/products', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'ProductList', id: 'LIST' },
            ]
          : [{ type: 'ProductList', id: 'LIST' }],
    }),
    getProduct: builder.query<{ data: ProductDetail }, string>({
      query: (idOrSlug) => `/products/${idOrSlug}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<{ data: ProductDetail }, CreateProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'ProductList', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<
      { data: ProductDetail },
      { id: string; body: Partial<CreateProductInput> }
    >({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'ProductList', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation<{ data: { success: boolean } }, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'ProductList', id: 'LIST' }],
    }),
    createOrder: builder.mutation<{ data: OrderListItem }, CreateOrderInput>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'OrderList', id: 'LIST' }],
    }),
    listOrders: builder.query<{ data: OrderListItem[] }, void>({
      query: () => '/me/orders',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'OrderList', id: 'LIST' },
            ]
          : [{ type: 'OrderList', id: 'LIST' }],
    }),
    getOrder: builder.query<{ data: OrderListItem }, string>({
      query: (id) => `/me/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    listAdminOrderRequests: builder.query<
      { data: AdminOrderRequest[] },
      { status?: OrderStatus } | void
    >({
      query: (params) => ({
        url: '/admin/orders',
        params: params ?? {},
      }),
      providesTags: [{ type: 'OrderList', id: 'ADMIN' }],
    }),
    reviewOrderRequest: builder.mutation<
      { data: AdminOrderRequest },
      { id: string; body: ReviewOrderInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/orders/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'OrderList', id: 'ADMIN' },
        { type: 'OrderList', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useListAdminOrderRequestsQuery,
  useReviewOrderRequestMutation,
} = shopApi
