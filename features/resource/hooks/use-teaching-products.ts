"use client"

import { useListBatchesQuery } from "@/features/batch/api"
import { useListCoursesQuery } from "@/features/course/api"

export function useTeachingProducts() {
  const batchesQuery = useListBatchesQuery({ pageSize: 100 })
  const coursesQuery = useListCoursesQuery({ pageSize: 100 })

  return {
    batches: batchesQuery.data?.data ?? [],
    courses: coursesQuery.data?.data ?? [],
    isLoading: batchesQuery.isLoading || coursesQuery.isLoading,
    isError: batchesQuery.isError || coursesQuery.isError,
  }
}
