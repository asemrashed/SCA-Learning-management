import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/api'
import { batchApi } from '@/features/batch/api'
import { courseApi } from '@/features/course/api'
import { enrollmentApi } from '@/features/enrollment/api'
import { resourceApi } from '@/features/resource/api'
import { assessmentApi } from '@/features/assessment/api'
import { liveclassApi } from '@/features/liveclass/api'
import { paymentApi } from '@/features/payment/api'
import { uploadApi } from '@/features/upload/api'
import { certificateApi } from '@/features/certificate/api'
import { rootReducer } from './rootReducer'

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        batchApi.middleware,
        courseApi.middleware,
        enrollmentApi.middleware,
        resourceApi.middleware,
        assessmentApi.middleware,
        liveclassApi.middleware,
        paymentApi.middleware,
        uploadApi.middleware,
        certificateApi.middleware,
      ),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
