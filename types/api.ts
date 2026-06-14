export enum Role {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
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
  rollNumber: string | null
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
  rollNumber: string | null
  progressPct: number
  batch: { id: string; title: string } | null
  course: { id: string; title: string } | null
  subjects?: EnrollmentSubject[]
  modules?: EnrollmentModule[]
}

export interface CreateEnrollmentInput {
  batchId?: string
  courseId?: string
}

export interface AdminEnrollmentRequest {
  id: string
  kind: EnrollmentKind
  status: EnrollmentStatus
  rollNumber: string | null
  enrolledAt: string
  student: { id: string; name: string; phone: string }
  batch: { id: string; title: string } | null
  course: { id: string; title: string } | null
  totalSeats: number | null
  totalEnrollments: number
}

export interface ReviewEnrollmentInput {
  action: 'approve' | 'reject'
  rollNumber?: string
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  WRITTEN = 'WRITTEN',
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
}

export interface Question {
  id: string
  stem: string
  type: QuestionType
  options: { key: string; text: string }[] | null
  correct?: unknown
  category: string | null
  marks: number
  createdAt: string
  updatedAt: string
}

export interface QuestionListResponse {
  data: Question[]
  meta: PaginationMeta
}

export interface CreateQuestionInput {
  stem: string
  type: QuestionType
  options?: { key: string; text: string }[] | null
  correct: unknown
  category?: string | null
  marks?: number
}

export interface ExamListItem {
  id: string
  title: string
  status: ExamStatus
  durationMin: number | null
  totalMarks: number
  moduleId: string | null
  opensAt: string | null
  closesAt: string | null
  questionCount: number
  attempt?: {
    id: string
    status: AttemptStatus
    scoreMarks: number | null
    scorePct: number | null
    submittedAt: string | null
  } | null
}

export interface ExamQuestion {
  id: string
  stem: string
  type: QuestionType
  options: { key: string; text: string }[] | null
  marks: number
  order: number
}

export interface ExamDetail extends ExamListItem {
  questions: ExamQuestion[]
}

export interface ExamAttempt {
  id: string
  examId: string
  status: AttemptStatus
  answers: Record<string, unknown>
  scoreMarks: number | null
  scorePct: number | null
  startedAt: string
  submittedAt: string | null
  expiresAt: string | null
  exam: {
    id: string
    title: string
    durationMin: number | null
    totalMarks: number
    questions: ExamQuestion[]
  }
}

export interface CreateExamInput {
  batchId?: string
  courseId?: string
  moduleId?: string | null
  title: string
  durationMin?: number | null
  questionIds: string[]
  status?: 'DRAFT' | 'PUBLISHED'
}

export interface AssignmentListItem {
  id: string
  title: string
  description: string | null
  totalMarks: number
  moduleId: string | null
  dueAt: string | null
  submission?: {
    id: string
    scoreMarks: number | null
    feedback: string | null
    submittedAt: string
    gradedAt: string | null
  } | null
}

export interface CreateAssignmentInput {
  batchId?: string
  courseId?: string
  moduleId?: string | null
  title: string
  description?: string | null
  totalMarks?: number
  dueAt?: string | null
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  fileUrl: string | null
  text: string | null
  scoreMarks: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
}

export interface CreateSubmissionInput {
  fileUrl?: string | null
  text?: string | null
}

export interface GradeSubmissionInput {
  scoreMarks: number
  feedback?: string | null
}

export interface UpdateAttemptInput {
  answers: Record<string, unknown>
  submit?: boolean
}

export interface ResourceItem {
  id: string
  title: string
  fileUrl: string
  fileType: string | null
  batchId: string | null
  courseId: string | null
  moduleId: string | null
  lessonId: string | null
  createdAt: string
}

export interface ResourceListResponse {
  data: ResourceItem[]
  meta: PaginationMeta
}

export interface CreateResourceInput {
  title: string
  fileUrl: string
  fileType?: 'pdf' | 'slide' | 'link' | null
  batchId?: string
  courseId?: string
  moduleId?: string | null
  lessonId?: string | null
}

export interface ResourceListQuery {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  batchId?: string
  courseId?: string
  moduleId?: string
  lessonId?: string
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface LiveSession {
  id: string
  batchId: string | null
  courseId: string | null
  title: string
  status: SessionStatus
  joinUrl: string | null
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
  recording: {
    id: string
    title: string
    videoUrl: string
    durationS: number | null
  } | null
}

export interface Recording {
  id: string
  batchId: string | null
  courseId: string | null
  lessonId: string | null
  sessionId: string | null
  title: string
  videoUrl: string
  durationS: number | null
  createdAt: string
}

export interface AttendanceSummary {
  sessionId: string
  sessionTitle: string
  batchId: string
  batchTitle: string
  scheduledAt: string
  status: AttendanceStatus
  markedAt: string
}

export interface CreateSessionInput {
  batchId?: string
  courseId?: string
  title: string
  scheduledAt: string
  joinUrl?: string
}

export interface UpdateSessionInput {
  title?: string
  status?: SessionStatus
  joinUrl?: string | null
  scheduledAt?: string
  startedAt?: string | null
  endedAt?: string | null
}

export interface CreateRecordingInput {
  batchId?: string
  courseId?: string
  lessonId?: string
  sessionId?: string
  title: string
  videoUrl: string
  durationS?: number
}

export interface MarkAttendanceInput {
  studentId: string
  status: AttendanceStatus
}

export enum PaymentPurpose {
  ORDER = 'ORDER',
  ENROLLMENT = 'ENROLLMENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface InitiatePaymentInput {
  purpose: PaymentPurpose
  refId: string
  couponCode?: string
}

export interface PaymentRecord {
  id: string
  status: PaymentStatus
  amountMinor: number
  enrollmentId: string | null
}

export interface CertificateItem {
  id: string
  serial: string
  pdfUrl: string | null
  issuedAt: string
  enrollmentId: string
  kind: EnrollmentKind
  productTitle: string
  productId: string
  studentName: string
}

export interface CertificateVerifyResult {
  valid: true
  serial: string
  studentName: string
  productTitle: string
  kind: EnrollmentKind
  issuedAt: string
  pdfUrl: string | null
}

export interface IssueCertificateInput {
  enrollmentId: string
}

export enum ProductType {
  BOOK = 'BOOK',
  NOTES = 'NOTES',
  QUESTION_BANK = 'QUESTION_BANK',
  OTHER = 'OTHER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface ProductListItem {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  type: ProductType
  priceMinor: number
  isPublished: boolean
}

export interface ProductListResponse {
  data: ProductListItem[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ProductDetail {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  type: ProductType
  priceMinor: number
  stock: number | null
  isPublished: boolean
  digitalUrl?: string | null
}

export interface CreateProductInput {
  title: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  type?: ProductType
  priceMinor?: number
  stock?: number | null
  isPublished?: boolean
  digitalUrl?: string | null
}

export interface OrderItem {
  id: string
  productId: string
  title: string
  quantity: number
  unitPriceMinor: number
  lineTotalMinor: number
}

export interface OrderListItem {
  id: string
  status: OrderStatus
  totalMinor: number
  createdAt: string
  itemCount: number
  items: OrderItem[]
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[]
}

export interface AdminOrderRequest extends OrderListItem {
  student: {
    id: string
    name: string
    phone: string
  }
}

export interface ReviewOrderInput {
  action: 'confirm' | 'cancel'
}
