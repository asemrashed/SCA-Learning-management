import { ResourceCategory } from '@/types/api'

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  [ResourceCategory.GENERAL]: 'General resource',
  [ResourceCategory.LECTURE_SHEET]: 'Lecture sheet',
  [ResourceCategory.SOLUTION_PDF]: 'Solution PDF',
  [ResourceCategory.NOTICE]: 'Notice',
  [ResourceCategory.RESULT_SHEET]: 'Result sheet',
  [ResourceCategory.EXAM]: 'Exam',
  [ResourceCategory.ASSIGNMENT]: 'Assignment',
}

export const PDF_RESOURCE_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.NOTICE,
  ResourceCategory.RESULT_SHEET,
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
])

/** Course + subject only — no chapter/lesson picker. */
export const SUBJECT_ONLY_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.NOTICE,
  ResourceCategory.RESULT_SHEET,
])

/** Shown on Admin → Resources only (not Exams / Assignments pages). */
export const CONTENT_RESOURCE_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.GENERAL,
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.NOTICE,
  ResourceCategory.RESULT_SHEET,
])

export const ASSESSMENT_RESOURCE_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
])

export function isPdfResourceCategory(category: ResourceCategory): boolean {
  return PDF_RESOURCE_CATEGORIES.has(category)
}

export function isContentResourceCategory(category: ResourceCategory): boolean {
  return CONTENT_RESOURCE_CATEGORIES.has(category)
}
