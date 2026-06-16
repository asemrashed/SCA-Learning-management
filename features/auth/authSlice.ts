import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types/api'

interface AuthState {
  accessToken: string | null
  user: User | null
  /** False until client bootstrap finishes (refresh attempt or no session cookie). */
  authReady: boolean
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  authReady: false,
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
    setAuthReady(state) {
      state.authReady = true
    },
  },
})

export const { setCredentials, clearCredentials, setAuthReady } = authSlice.actions
export default authSlice.reducer
