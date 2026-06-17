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
import { adminUserApi } from '@/features/admin-user/api'
import { shopApi } from '@/features/shop/api'
import { categoryApi } from '@/features/category/api'
import { monthlyPaymentApi } from '@/features/monthly-payment/api'
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
        adminUserApi.middleware,
        shopApi.middleware,
        categoryApi.middleware,
        monthlyPaymentApi.middleware,
      ),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
