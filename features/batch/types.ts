export type BatchStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface BatchListItem {
  id: string
  title: string
  slug: string
  courseId: string
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

export interface BatchCourseSummary {
  id: string
  title: string
  slug: string
  deliveryMode: string
}

export interface BatchDetail {
  id: string
  title: string
  slug: string
  courseId: string
  course: BatchCourseSummary
  status: BatchStatus
  priceMinor: number
  capacity: number | null
  registrationDeadline: string | null
  startDate: string | null
  endDate: string | null
  thumbnail: string | null
  instructors: BatchInstructor[]
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
  courseId?: string
  sort?: string
}

export interface CreateBatchBodyInput {
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
}

export type UpdateBatchInput = Partial<CreateBatchBodyInput>

export interface BatchContentGrant {
  id: string
  grantingBatchId: string
  grantingBatch: { id: string; title: string }
  receivingBatchId: string
  createdAt: string
}
