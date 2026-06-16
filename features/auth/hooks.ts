import { useSelector } from 'react-redux'
import type { RootState } from '@/store/rootReducer'

/** Skip RTK Query calls until session restore finishes and a token is available. */
export function useAuthQuerySkip(): boolean {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const authReady = useSelector((state: RootState) => state.auth.authReady)
  return !authReady || !accessToken
}
