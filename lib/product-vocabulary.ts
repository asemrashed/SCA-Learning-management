/**
 * User-facing product names. API / code still uses batch & course internally.
 * Recorded courses are hidden from all dashboards when SHOW_RECORDED_COURSES is false.
 */
export const SHOW_RECORDED_COURSES = false

export const LIVE_COURSE = 'Live course'
export const LIVE_COURSES = 'Live courses'
export const MY_LIVE_COURSES = 'My live courses'
export const BROWSE_LIVE_COURSES = 'Browse live courses'
export const NEW_LIVE_COURSE = 'New live course'
export const EDIT_LIVE_COURSE = 'Edit live course'
export const SAVE_LIVE_COURSE = 'Save live course'
export const MANAGE_LIVE_COURSES = 'Manage live courses'

export const RECORDED_COURSE = 'Recorded course'
export const RECORDED_COURSES = 'Recorded courses'

export function liveCourseCount(n: number): string {
  return `${n} live course${n === 1 ? '' : 's'}`
}

export function learningSystemLabel(scope: 'batch' | 'course'): string {
  return scope === 'batch' ? LIVE_COURSE : RECORDED_COURSE
}

/** Marketing + nav links for the live-course catalog (URL stays /batches). */
export const LIVE_COURSE_CATALOG_HREF = '/batches'

export const CHAPTER = 'Chapter'
export const CHAPTERS = 'Chapters'
