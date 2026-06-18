/**
 * User-facing product names. API uses Course (deliveryMode LIVE | RECORDED) and Batch (cohort).
 */
export const COURSE = 'Course'
export const COURSES = 'Courses'
export const MY_COURSES = 'My courses'
export const BROWSE_COURSES = 'Browse courses'
export const NEW_COURSE = 'New course'
export const EDIT_COURSE = 'Edit course'
export const SAVE_COURSE = 'Save course'
export const MANAGE_COURSES = 'Manage courses'

export const LIVE_COURSE = 'Live course'
export const LIVE_COURSES = 'Live courses'
export const RECORDED_COURSE = 'Recorded course'
export const RECORDED_COURSES = 'Recorded courses'

export const BATCH = 'Batch'
export const BATCHES = 'Batches'
export const OUR_LIVE_BATCHES = 'Our live batches'
export const OUR_LIVE_COURSES = 'Our Live courses'
export const OUR_RECORDED_COURSES = 'Our Recorded Courses'
export const NEW_BATCH = 'New batch'
export const EDIT_BATCH = 'Edit batch'
export const SAVE_BATCH = 'Save batch'

export function courseCount(n: number): string {
  return `${n} course${n === 1 ? '' : 's'}`
}

export function batchCount(n: number): string {
  return `${n} batch${n === 1 ? '' : 'es'}`
}

export function studentCount(n: number): string {
  return `${n} student${n === 1 ? '' : 's'}`
}

/** @deprecated use courseCount */
export const liveCourseCount = courseCount

export function deliveryModeLabel(mode: 'LIVE' | 'RECORDED'): string {
  return mode === 'LIVE' ? LIVE_COURSE : RECORDED_COURSE
}

/** Public catalog — recorded courses enroll directly; live programs list cohorts at /batches */
export const COURSE_CATALOG_HREF = '/courses'
export const LIVE_BATCH_CATALOG_HREF = '/batches'

/** @deprecated use COURSE_CATALOG_HREF */
export const LIVE_COURSE_CATALOG_HREF = LIVE_BATCH_CATALOG_HREF

/** @deprecated use BROWSE_COURSES */
export const BROWSE_LIVE_COURSES = 'Browse live batches'

/** @deprecated use MY_COURSES */
export const MY_LIVE_COURSES = MY_COURSES

/** @deprecated use MANAGE_COURSES */
export const MANAGE_LIVE_COURSES = MANAGE_COURSES

/** @deprecated use NEW_COURSE */
export const NEW_LIVE_COURSE = NEW_COURSE

/** @deprecated use EDIT_COURSE */
export const EDIT_LIVE_COURSE = EDIT_COURSE

/** @deprecated use SAVE_COURSE */
export const SAVE_LIVE_COURSE = SAVE_COURSE

export const CHAPTER = 'Chapter'
export const CHAPTERS = 'Chapters'

export const LESSON_TYPE_LABEL: Record<string, string> = {
  RECORDED: 'Recorded video',
  LIVE: 'Live session',
  TEXT: 'Text',
  DOCUMENT: 'Document',
  VIDEO: 'Recorded video',
}
