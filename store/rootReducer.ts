import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import { authApi } from '@/features/auth/api'

export const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
})

export type RootState = ReturnType<typeof rootReducer>
