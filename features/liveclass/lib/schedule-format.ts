const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const WEEKDAY_OPTIONS = DAY_NAMES.map((label, value) => ({ label, value }))

export function formatDaysOfWeek(days: number[]): string {
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => DAY_NAMES[day] ?? `Day ${day}`)
    .join(', ')
}

export function formatScheduleTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatTimeRange(startTime: string, endTime: string | null): string {
  if (!endTime) {
    return formatScheduleTime(startTime)
  }
  return `${formatScheduleTime(startTime)} – ${formatScheduleTime(endTime)}`
}

export function formatScheduledDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatScheduleDay(schedule: {
  type: string
  daysOfWeek: number[]
  scheduledDate: string | null
}): string {
  if (schedule.type === "ONE_TIME" && schedule.scheduledDate) {
    return formatScheduledDate(schedule.scheduledDate)
  }
  return formatDaysOfWeek(schedule.daysOfWeek)
}

export function sortLiveClasses<T extends {
  type: string
  order: number
  subject: string
  scheduledDate: string | null
  startTime?: string
}>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "RECURRING" ? -1 : 1
    }
    if (a.type === "ONE_TIME" && a.scheduledDate && b.scheduledDate) {
      const dateCmp = a.scheduledDate.localeCompare(b.scheduledDate)
      if (dateCmp !== 0) return dateCmp
      return (a.startTime ?? "").localeCompare(b.startTime ?? "")
    }
    if (a.order !== b.order) return a.order - b.order
    return a.subject.localeCompare(b.subject)
  })
}

export function combineDateAndTime(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number)
  const [hours, minutes] = time.split(":").map(Number)
  const value = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return value.toISOString()
}
