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
  RECORDED = 'RECORDED',
  LIVE = 'LIVE',
  TEXT = 'TEXT',
  DOCUMENT = 'DOCUMENT',
}

export enum DeliveryMode {
  LIVE = 'LIVE',
  RECORDED = 'RECORDED',
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
  deliveryMode: DeliveryMode
  thumbnail: string | null
  category: string | null
  categorySlug: string | null
  categoryId: string | null
  priceMinor: number
  isPublished: boolean
  batchCount?: number
  studentCount?: number
}

export interface CourseLesson {
  id: string
  title: string
  type: LessonType
  durationS: number | null
  lectureDate?: string | null
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

export interface CourseSubject {
  id: string
  title: string
  order: number
  modules: CourseModule[]
}

export interface CourseBatchSummary {
  id: string
  title: string
  slug: string
  status: string
  priceMinor: number
  startDate: string | null
}

export interface CourseFaqItem {
  question: string
  answer: string
}

export interface CourseDetail {
  id: string
  title: string
  slug: string
  deliveryMode: DeliveryMode
  description: string | null
  thumbnail: string | null
  category: string | null
  categorySlug: string | null
  categoryId: string | null
  priceMinor: number
  faq: CourseFaqItem[]
  isPublished: boolean
  modules?: CourseModule[]
  subjects?: CourseSubject[]
  batches?: CourseBatchSummary[]
  studentCount?: number
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

export interface CourseInputSubject {
  title: string
  order: number
  modules?: CourseInputModule[]
}

export interface CreateRecordedCourseInput {
  deliveryMode: DeliveryMode.RECORDED
  title: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  categoryId?: string | null
  priceMinor?: number
  faq?: CourseFaqItem[] | null
  isPublished?: boolean
  modules?: CourseInputModule[]
}

export interface CreateLiveCourseInput {
  deliveryMode: DeliveryMode.LIVE
  title: string
  slug: string
  description?: string | null
  thumbnail?: string | null
  categoryId?: string | null
  faq?: CourseFaqItem[] | null
  isPublished?: boolean
}

export type CreateCourseInput = CreateRecordedCourseInput | CreateLiveCourseInput

export type UpdateCourseInput = Partial<
  Omit<CreateRecordedCourseInput, 'deliveryMode'> & {
    modules?: CourseInputModule[]
    faq?: CourseFaqItem[] | null
  }
>

export interface ApplyBatchCurriculumInput {
  batchIds: string[]
  subjects: CourseInputSubject[]
}

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
  deliveryMode: DeliveryMode
  batch: {
    id: string
    title: string
    thumbnail: string | null
    course: { id: string; title: string }
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
  lectureDate: string | null
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
  deliveryMode: DeliveryMode
  status: EnrollmentStatus
  rollNumber: string | null
  progressPct: number
  batch: { id: string; title: string; courseId?: string } | null
  course: { id: string; title: string } | null
  subjects?: EnrollmentSubject[]
  grantedSubjects?: EnrollmentSubject[]
  modules?: EnrollmentModule[]
  grantedBatchIds?: string[]
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
  PDF = 'PDF',
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
  fileUrl: string | null
  batchId: string | null
  subjectId: string | null
  moduleId: string | null
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
  correct?: unknown
  category?: string | null
  marks?: number
  fileUrl?: string | null
  batchId?: string | null
  subjectId?: string | null
  moduleId?: string | null
}

export interface CreatePdfQuestionsBulkInput {
  batchId: string
  subjectId: string
  moduleId?: string | null
  questions: {
    title: string
    fileUrl: string
    marks?: number
  }[]
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
  courseId: string
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
  courseId: string
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
  fileUrl: string | null
  fileType: string | null
  category: ResourceCategory
  courseId: string | null
  batchId: string | null
  subjectId: string | null
  moduleId: string | null
  lessonId: string | null
  deadlineAt: string | null
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
  category?: ResourceCategory
  courseId: string
  batchId?: string | null
  subjectId?: string | null
  moduleId?: string | null
  lessonId?: string | null
  deadlineAt?: string | null
}

export interface UpdateResourceInput {
  title?: string
  fileUrl?: string
  fileType?: 'pdf' | 'slide' | 'link' | null
  category?: ResourceCategory
  batchId?: string | null
  subjectId?: string | null
  moduleId?: string | null
  lessonId?: string | null
  deadlineAt?: string | null
}

export interface ResourceListQuery {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
  courseId?: string
  batchId?: string
  subjectId?: string
  moduleId?: string
  lessonId?: string
  category?: ResourceCategory
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum LiveClassType {
  RECURRING = 'RECURRING',
  ONE_TIME = 'ONE_TIME',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface LiveSession {
  id: string
  batchId: string
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
  batchId: string
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
  batchId: string
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

export interface LiveClassSchedule {
  id: string
  batchId: string
  type: LiveClassType
  subject: string
  daysOfWeek: number[]
  scheduledDate: string | null
  startTime: string
  endTime: string | null
  passcode: string | null
  joinUrl: string
  order: number
  createdAt: string
  updatedAt: string
  sessionId: string | null
}

export interface CreateLiveClassScheduleInput {
  batchId: string
  type: LiveClassType
  subject: string
  daysOfWeek?: number[]
  scheduledDate?: string
  startTime: string
  endTime?: string
  passcode?: string
  joinUrl: string
  order?: number
}

export interface UpdateLiveClassScheduleInput {
  type?: LiveClassType
  subject?: string
  daysOfWeek?: number[]
  scheduledDate?: string | null
  startTime?: string
  endTime?: string | null
  passcode?: string | null
  joinUrl?: string
  order?: number
}

export interface CreateRecordingInput {
  batchId: string
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

export enum MonthlyPaymentStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface MonthlyPaymentEnrollment {
  id: string
  kind: EnrollmentKind
  status: EnrollmentStatus
  rollNumber: string | null
  courseTitle: string
  batchTitle: string | null
  courseId: string | null
  batchId: string | null
}

export interface MonthlyPaymentStudent {
  id: string
  name: string
  phone: string
  rollNumber: string | null
}

export interface MonthlyPaymentRecord {
  id: string
  billingMonth: string
  amountMinor: number | null
  status: MonthlyPaymentStatus
  note: string | null
  requestedAt: string
  reviewedAt: string | null
  student: MonthlyPaymentStudent
  enrollment: MonthlyPaymentEnrollment
}

export interface EnrollmentPaymentHistoryItem {
  id: string
  type: 'MONTHLY' | 'ENROLLMENT'
  billingMonth: string | null
  amountMinor: number
  status: string
  paidAt: string | null
  createdAt: string
}

export interface EnrollmentPaymentHistory {
  enrollment: MonthlyPaymentEnrollment
  currentBillingMonth: string
  canRequestCurrentMonth: boolean
  currentMonthRequest: MonthlyPaymentRecord | null
  whatsappUrl: string
  history: EnrollmentPaymentHistoryItem[]
}

export interface ReviewMonthlyPaymentInput {
  action: 'approve' | 'reject'
  amountMinor?: number
  note?: string
}

export interface ListMonthlyPaymentsParams {
  status?: MonthlyPaymentStatus
  courseId?: string
  batchId?: string
  search?: string
  page?: number
  pageSize?: number
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

export enum ResourceCategory {
  GENERAL = 'GENERAL',
  LECTURE_SHEET = 'LECTURE_SHEET',
  SOLUTION_PDF = 'SOLUTION_PDF',
  NOTICE = 'NOTICE',
  RESULT_SHEET = 'RESULT_SHEET',
  MATH_SUGGESTION = 'MATH_SUGGESTION',
  THEORY_SUGGESTION = 'THEORY_SUGGESTION',
  EXAM = 'EXAM',
  ASSIGNMENT = 'ASSIGNMENT',
}

export interface CategoryListItem {
  id: string
  title: string
  slug: string
  shortIntro: string | null
  image: string | null
  order: number
  courseCount: number
}

export interface CategoryListResponse {
  data: CategoryListItem[]
  meta: { page: number; pageSize: number; total: number }
}

export interface CategoryDetail extends CategoryListItem {
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  title: string
  slug: string
  shortIntro?: string | null
  image?: string | null
  order?: number
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
