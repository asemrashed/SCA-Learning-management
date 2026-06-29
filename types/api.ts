export enum Role {
  STUDENT = 'STUDENT',
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
  hasVideo: boolean
  hasDocument: boolean
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
  slug?: string
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
  slug?: string
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
  } | null
  course: {
    id: string
    title: string
    thumbnail: string | null
  } | null
  status: EnrollmentStatus
  rollNumber: string | null
}

export interface EnrollmentLesson {
  id: string
  title: string
  type: LessonType
  hasVideo: boolean
  hasDocument: boolean
  content: string | null
  durationS: number | null
  lectureDate: string | null
  order: number
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
  enrolledAt: string
  completedAt: string | null
  batch: { id: string; title: string; courseId?: string; endDate?: string | null } | null
  course: { id: string; title: string } | null
  subjects?: EnrollmentSubject[]
  grantedSubjects?: EnrollmentSubject[]
  modules?: EnrollmentModule[]
  grantedBatchIds?: string[]
  isAccessBlocked: boolean
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
  isBlocked: boolean
  enrolledAt: string
  student: { id: string; name: string; phone: string }
  batch: { id: string; title: string } | null
  course: { id: string; title: string } | null
  totalSeats: number | null
  totalEnrollments: number
}

export type ReviewEnrollmentInput =
  | { action: 'approve'; rollNumber: string; enrollmentFeeMinor?: number }
  | { action: 'reject' }
  | { action: 'remove' }
  | { action: 'block' }
  | { action: 'unblock' }

export interface ManualEnrollmentInput {
  studentId?: string
  name: string
  phone: string
  email?: string
  rollNumber: string
  batchId?: string
  courseId?: string
  enrollmentFeeMinor?: number
  firstMonthFeeMinor?: number
  billingStartMonth?: string
}

export interface EnrollmentStudentSearchResult {
  id: string
  name: string
  phone: string
  email: string | null
}

export interface AdminEnrollmentOverview {
  total: number
  pending: number
  active: number
  cancelled: number
  completed: number
}

export interface ListAdminEnrollmentsParams {
  status?: EnrollmentStatus
  page?: number
  pageSize?: number
}

export interface AdminPaymentSummary {
  totalRevenueMinor: number
  totalDueMinor: number
  currentBillingMonth: string
  unpaidStudentCount: number
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
  startsAt: string | null
  marks: number | null
  linkedQuestionIds: string[]
  createdAt: string
}

export interface ResourceListResponse {
  data: ResourceItem[]
  meta: PaginationMeta
}

export interface CreateResourceInput {
  title: string
  fileUrl?: string
  fileType?: 'pdf' | 'slide' | 'link' | null
  category?: ResourceCategory
  courseId: string
  batchId?: string | null
  subjectId?: string | null
  moduleId?: string | null
  lessonId?: string | null
  deadlineAt?: string | null
  startsAt?: string | null
  marks?: number | null
  linkedQuestionIds?: string[] | null
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
  startsAt?: string | null
  marks?: number | null
  linkedQuestionIds?: string[] | null
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
  dateFrom?: string
  dateTo?: string
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
  paymentDeadline: string
  isPastDeadline: boolean
  isAccessBlocked: boolean
  isCurrentMonthPaid: boolean
  canRequestCurrentMonth: boolean
  currentMonthRequest: MonthlyPaymentRecord | null
  whatsappUrl: string
  history: EnrollmentPaymentHistoryItem[]
}

export interface UnpaidStudentRecord {
  billingMonth: string
  paymentDeadline: string
  isPastDeadline: boolean
  isAccessBlocked: boolean
  hasAccessGrant: boolean
  student: MonthlyPaymentStudent
  enrollment: MonthlyPaymentEnrollment
  currentMonthRequest: MonthlyPaymentRecord | null
}

export interface SetPaymentAccessInput {
  billingMonth: string
  action: 'grant' | 'revoke'
}

export interface PaymentAccessResult {
  enrollmentId: string
  billingMonth: string
  hasAccessGrant: boolean
  isAccessBlocked: boolean
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
  QUESTION_BANK = 'QUESTION_BANK',
}

export enum ResourceSubmissionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface ResourceSubmissionRecord {
  id: string
  status: ResourceSubmissionStatus
  submittedAt: string
  reviewedAt: string | null
  resultFileUrl: string | null
  resultPublishedAt: string | null
  student: {
    id: string
    name: string
    phone: string
    rollNumber: string | null
  }
  enrollment: {
    id: string
    rollNumber: string | null
    courseTitle: string
    batchTitle: string | null
  }
  resource: {
    id: string
    title: string
    category: ResourceCategory
    subjectId: string | null
    subjectTitle: string | null
    courseId: string
    courseTitle: string
    batchId: string | null
    batchTitle: string | null
  }
}

export interface StudentAssessmentResult {
  id: string
  resourceTitle: string
  resourceCategory: ResourceCategory
  subjectTitle: string | null
  resultPublishedAt: string
}

export interface ListResourceSubmissionsParams {
  category: ResourceCategory.EXAM | ResourceCategory.ASSIGNMENT
  status?: ResourceSubmissionStatus
  courseId?: string
  batchId?: string
  search?: string
  hasResult?: boolean
  page?: number
  pageSize?: number
}

export interface ReviewResourceSubmissionInput {
  action: 'accept' | 'reject'
}

export interface UploadResourceSubmissionResultInput {
  resultFileUrl: string
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
  freePreviewPages: number
  hasDigitalFile: boolean
  digitalUrl?: string | null
}

export interface ProductDigitalAccess {
  hasFullAccess: boolean
  freePreviewPages: number
  hasDigitalFile: boolean
}

export interface CreateProductInput {
  title: string
  slug?: string
  description?: string | null
  thumbnail?: string | null
  type?: ProductType
  priceMinor?: number
  stock?: number | null
  isPublished?: boolean
  digitalUrl?: string | null
  freePreviewPages?: number
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

export enum ReviewStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
}

export interface ReviewPublicItem {
  id: string
  text: string
  createdAt: string
  studentName: string
  studentAvatarUrl: string | null
  courseTitle: string
  batchTitle: string | null
}

export interface ReviewStudentItem extends ReviewPublicItem {
  courseId: string
  batchId: string | null
  enrollmentId: string | null
  status: ReviewStatus
  reviewedAt: string | null
}

export interface ReviewAdminItem extends ReviewStudentItem {
  studentId: string
  studentPhone: string
}

export interface CreateReviewInput {
  courseId: string
  batchId?: string
  enrollmentId?: string
  text: string
}

export interface ModerateReviewInput {
  action: 'activate' | 'hide'
}

export interface ListAdminReviewsParams {
  status?: ReviewStatus
  courseId?: string
  batchId?: string
  period?: 'week' | 'month' | 'all'
  page?: number
  pageSize?: number
}
