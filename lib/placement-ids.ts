import type { CurriculumPlacement } from '@/components/curriculum-placement-picker'

export function resolvePlacementIds(placement: {
  courseId?: string
}): { courseId?: string; error?: string } {
  const courseId = placement.courseId?.trim() ? placement.courseId.trim() : undefined

  if (!courseId) {
    return { error: 'Please select a course.' }
  }

  return { courseId }
}

export function resolveCourseIdFromFixed(
  fixedCourseId?: string,
  fixedBatchId?: string,
  batchCourseId?: string,
): string | undefined {
  return fixedCourseId ?? batchCourseId ?? undefined
}
