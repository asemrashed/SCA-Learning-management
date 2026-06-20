import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
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
import { reviewApi } from '@/features/review/api'

export const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [batchApi.reducerPath]: batchApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [enrollmentApi.reducerPath]: enrollmentApi.reducer,
  [resourceApi.reducerPath]: resourceApi.reducer,
  [assessmentApi.reducerPath]: assessmentApi.reducer,
  [liveclassApi.reducerPath]: liveclassApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
  [certificateApi.reducerPath]: certificateApi.reducer,
  [adminUserApi.reducerPath]: adminUserApi.reducer,
  [shopApi.reducerPath]: shopApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
  [monthlyPaymentApi.reducerPath]: monthlyPaymentApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
})

export type RootState = ReturnType<typeof rootReducer>
