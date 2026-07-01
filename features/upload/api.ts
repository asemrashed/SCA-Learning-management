import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/apiClient'

export type UploadFolder = 'images' | 'videos' | 'documents' | 'files'

export interface UploadResult {
  url: string
  key: string
  originalName: string
  mimeType: string
  size: number
}

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    uploadFile: builder.mutation<
      { data: UploadResult },
      { file: File; folder: UploadFolder }
    >({
      query: ({ file, folder }) => {
        const body = new FormData()
        // folder must be sent before file so Multer can read it when choosing destination
        body.append('folder', folder)
        body.append('file', file)
        return { url: '/uploads', method: 'POST', body }
      },
    }),
  }),
})

export const { useUploadFileMutation } = uploadApi
