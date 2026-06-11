export type BatchStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type LessonType = 'VIDEO' | 'LIVE' | 'TEXT' | 'DOCUMENT'

export interface BatchListItem {
  id: string
  title: string
  slug: string
  status: BatchStatus
  priceMinor: number
  capacity: number | null
  registrationDeadline: string | null
  startDate: string | null
  endDate: string | null
  thumbnail: string | null
}

export interface BatchInstructor {
  id: string
  name: string
  avatarUrl: string | null
}

export interface BatchLesson {
  id: string
  title: string
  type: LessonType
  durationS: number | null
  order: number
  isPreview: boolean
  videoUrl?: string | null
}

export interface BatchModule {
  id: string
  title: string
  order: number
  lessons: BatchLesson[]
}

export interface BatchSubject {
  id: string
  title: string
  order: number
  modules: BatchModule[]
}

export interface BatchDetail {
  id: string
  title: string
  slug: string
  status: BatchStatus
  priceMinor: number
  capacity: number | null
  registrationDeadline: string | null
  startDate: string | null
  endDate: string | null
  thumbnail: string | null
  instructors: BatchInstructor[]
  subjects: BatchSubject[]
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
}

export interface BatchListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: BatchStatus
  sort?: string
}

export interface BatchInputLesson {
  title: string
  type?: LessonType
  videoUrl?: string | null
  content?: string | null
  durationS?: number | null
  order: number
  isPreview?: boolean
}

export interface BatchInputModule {
  title: string
  order: number
  lessons?: BatchInputLesson[]
}

export interface BatchInputSubject {
  title: string
  order: number
  modules?: BatchInputModule[]
}

export interface CreateBatchInput {
  title: string
  slug: string
  status?: BatchStatus
  priceMinor?: number
  capacity?: number | null
  registrationDeadline?: string | null
  startDate?: string | null
  endDate?: string | null
  thumbnail?: string | null
  instructorIds?: string[]
  subjects?: BatchInputSubject[]
}

export type UpdateBatchInput = Partial<CreateBatchInput>
