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
  [ResourceCategory.QUESTION_BANK]: 'Question bank',
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
  ResourceCategory.QUESTION_BANK,
])

/** Must be placed on a chapter. */
export const CHAPTER_REQUIRED_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
])

/** Chapter is optional; live courses still need batch + subject. */
export const CHAPTER_OPTIONAL_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.MATH_SUGGESTION,
  ResourceCategory.THEORY_SUGGESTION,
])

export const SUBJECT_REQUIRED_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
  ResourceCategory.QUESTION_BANK,
])

export const LIVE_SUBJECT_SCOPED_CATEGORIES = new Set<ResourceCategory>([
  ResourceCategory.LECTURE_SHEET,
  ResourceCategory.SOLUTION_PDF,
  ResourceCategory.MATH_SUGGESTION,
  ResourceCategory.THEORY_SUGGESTION,
  ResourceCategory.EXAM,
  ResourceCategory.ASSIGNMENT,
  ResourceCategory.QUESTION_BANK,
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
  ResourceCategory.QUESTION_BANK,
])

/** Shown on Admin → Resources only (not Exams / Assignments / Question bank pages). */
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
  ResourceCategory.QUESTION_BANK,
])

export const QUESTION_BANK_CATEGORY = ResourceCategory.QUESTION_BANK

export function isPdfResourceCategory(category: ResourceCategory): boolean {
  return PDF_RESOURCE_CATEGORIES.has(category)
}

export function isContentResourceCategory(category: ResourceCategory): boolean {
  return CONTENT_RESOURCE_CATEGORIES.has(category)
}

export function isChapterRequiredCategory(category: ResourceCategory): boolean {
  return CHAPTER_REQUIRED_CATEGORIES.has(category)
}

export function isChapterOptionalCategory(category: ResourceCategory): boolean {
  return CHAPTER_OPTIONAL_CATEGORIES.has(category)
}

export function isSubjectRequiredCategory(
  category: ResourceCategory,
  isLive: boolean,
): boolean {
  if (SUBJECT_REQUIRED_CATEGORIES.has(category)) return true
  if (isLive && LIVE_SUBJECT_SCOPED_CATEGORIES.has(category)) return true
  return false
}

export function isDeadlineCategory(category: ResourceCategory): boolean {
  return DEADLINE_CATEGORIES.has(category)
}

export function isBatchScopedCategory(category: ResourceCategory): boolean {
  return BATCH_SCOPED_CATEGORIES.has(category)
}
