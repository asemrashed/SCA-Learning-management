import { ResourceCategory } from '@/types/api'

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  [ResourceCategory.GENERAL]: 'General resource',
  [ResourceCategory.LECTURE_SHEET]: 'Lecture sheet',
  [ResourceCategory.SOLUTION_PDF]: 'Solution PDF',
  [ResourceCategory.NOTICE]: 'Notice',
  [ResourceCategory.RESULT_SHEET]: 'Result sheet',
  [ResourceCategory.MATH_SUGGESTION]: 'Math suggestion',
  [ResourceCategory.THEORY_SUGGESTION]: 'Theory suggestion',
  [ResourceCategory.EXAM]: 'Exam',
  [ResourceCategory.ASSIGNMENT]: 'Assignment',
}

export const PDF_RESOURCE_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.NOTICE,
  ResourceCategory.RESULT_SHEET,
  ResourceCategory.MATH_SUGGESTION,
  ResourceCategory.THEORY_SUGGESTION,
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
])

export const SUBJECT_REQUIRED_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
])

export const DEADLINE_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
])

export const BATCH_SCOPED_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.NOTICE,
  ResourceCategory.RESULT_SHEET,
  ResourceCategory.MATH_SUGGESTION,
  ResourceCategory.THEORY_SUGGESTION,
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
])

/** Shown on Admin → Resources only (not Exams / Assignments pages). */
export const CONTENT_RESOURCE_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.GENERAL,
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.NOTICE,
  ResourceCategory.RESULT_SHEET,
  ResourceCategory.MATH_SUGGESTION,
  ResourceCategory.THEORY_SUGGESTION,
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

export function isSubjectRequiredCategory(category: ResourceCategory): boolean {
  return SUBJECT_REQUIRED_CATEGORIES.has(category)
}

export function isDeadlineCategory(category: ResourceCategory): boolean {
  return DEADLINE_CATEGORIES.has(category)
}

export function isBatchScopedCategory(category: ResourceCategory): boolean {
  return BATCH_SCOPED_CATEGORIES.has(category)
}
