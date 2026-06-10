import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types/api'

interface AuthState {
  accessToken: string | null
  user: User | null
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; user: User }>) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
    },
    clearCredentials(state) {
      state.accessToken = null
      state.user = null
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
