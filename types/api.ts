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

export enum LessonType {
  VIDEO = 'VIDEO',
  LIVE = 'LIVE',
  TEXT = 'TEXT',
  DOCUMENT = 'DOCUMENT',
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
}

export interface CourseListItem {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  category: string | null
  priceMinor: number
  isPublished: boolean
}

export interface CourseLesson {
  id: string
  title: string
  type: LessonType
  durationS: number | null
  order: number
  isPreview: boolean
  videoUrl?: string | null
  content?: string | null
}

export interface CourseModule {
  id: string
  title: string
  order: number
  lessons: CourseLesson[]
}

export interface CourseDetail {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  category: string | null
  priceMinor: number
  isPublished: boolean
  modules: CourseModule[]
}

export interface CourseListResponse {
  data: CourseListItem[]
  meta: PaginationMeta
}

export interface CourseInputModule {
  title: string
  order: number
  lessons?: {
    title: string
    type?: LessonType
    videoUrl?: string | null
    content?: string | null
    durationS?: number | null
    order: number
    isPreview?: boolean
  }[]
}

export interface CreateCourseInput {
  title: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  category?: string | null
  priceMinor?: number
  isPublished?: boolean
  modules?: CourseInputModule[]
}

export type UpdateCourseInput = Partial<CreateCourseInput>

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum EnrollmentKind {
  BATCH = 'BATCH',
  COURSE = 'COURSE',
}

export interface EnrollmentListItem {
  id: string
  kind: EnrollmentKind
  batch: {
    id: string
    title: string
    thumbnail: string | null
    instructors: { name: string }[]
  } | null
  course: {
    id: string
    title: string
    thumbnail: string | null
  } | null
  status: EnrollmentStatus
  progressPct: number
  totalLessons: number
  completedLessons: number
  nextLesson: { id: string; title: string } | null
}

export interface EnrollmentLesson {
  id: string
  title: string
  type: LessonType
  videoUrl: string | null
  durationS: number | null
  order: number
  completed: boolean
}

export interface EnrollmentModule {
  id: string
  title: string
  order: number
  lessons: EnrollmentLesson[]
}

export interface EnrollmentSubject {
  id: string
  title: string
  order: number
  modules: EnrollmentModule[]
}

export interface EnrollmentDetail {
  id: string
  kind: EnrollmentKind
  status: EnrollmentStatus
  progressPct: number
  batch: { id: string; title: string } | null
  course: { id: string; title: string } | null
  subjects?: EnrollmentSubject[]
  modules?: EnrollmentModule[]
}

export interface CreateEnrollmentInput {
  batchId?: string
  courseId?: string
  couponCode?: string
}
