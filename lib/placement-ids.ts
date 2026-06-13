import type { CurriculumPlacement } from '@/components/curriculum-placement-picker'

export function resolvePlacementIds(placement: CurriculumPlacement): {
  batchId?: string
  courseId?: string
  error?: string
} {
  const batchId =
    placement.scope === 'batch' && placement.batchId?.trim()
      ? placement.batchId.trim()
      : undefined
  const courseId =
    placement.scope === 'course' && placement.courseId?.trim()
      ? placement.courseId.trim()
      : undefined

  if (batchId && courseId) {
    return { error: 'Choose either a batch or a course, not both.' }
  }
  if (!batchId && !courseId) {
    return {
      error:
        placement.scope === 'batch'
          ? 'Please select a batch under Learning system.'
          : 'Please select a course under Learning system.',
    }
  }

  return { batchId, courseId }
}
