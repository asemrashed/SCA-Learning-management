import { learningSystemLabel, LIVE_COURSE, SHOW_RECORDED_COURSES } from '@/lib/product-vocabulary'

export function resolvePlacementIds(placement: {
  scope: 'batch' | 'course'
  batchId?: string
  courseId?: string
}): { batchId?: string; courseId?: string; error?: string } {
  const batchId =
    placement.scope === 'batch' && placement.batchId?.trim()
      ? placement.batchId.trim()
      : undefined
  const courseId =
    placement.scope === 'course' && placement.courseId?.trim()
      ? placement.courseId.trim()
      : undefined

  if (batchId && courseId) {
    return { error: `Choose either a ${LIVE_COURSE.toLowerCase()} or a ${learningSystemLabel('course').toLowerCase()}, not both.` }
  }
  if (!batchId && !courseId) {
    return {
      error:
        placement.scope === 'batch' || !SHOW_RECORDED_COURSES
          ? `Please select a ${LIVE_COURSE.toLowerCase()}.`
          : `Please select a ${learningSystemLabel('course').toLowerCase()}.`,
    }
  }
  return { batchId, courseId }
}
