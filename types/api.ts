export enum Role {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  name: string
  phone: string
  phoneVerified: boolean
  email: string | null
  role: Role
  avatarUrl: string | null
  createdAt: string
}

export interface AuthTokensResponse {
  user: User
  accessToken: string
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: { field: string; issue: string }[]
}
