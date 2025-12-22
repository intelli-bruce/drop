/**
 * Format a date as relative time in Korean
 * - Less than 1 minute: "N초전"
 * - Less than 1 hour: "N분전"
 * - Today: "오늘 HH:MM"
 * - Yesterday: "어제 HH:MM"
 * - Older: "YYYY. MM. DD. HH:MM"
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Future date - show full format
  if (diffMs < 0) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: localTimeZone,
    }).format(target)
  }

  // Less than 1 minute
  if (diffMs < 60_000) {
    const seconds = Math.max(1, Math.floor(diffMs / 1000))
    return `${seconds}초전`
  }

  // Less than 1 hour
  if (diffMs < 60 * 60_000) {
    const minutes = Math.max(1, Math.floor(diffMs / 60_000))
    return `${minutes}분전`
  }

  // Get local date string for comparison
  const getLocalDateParts = (d: Date) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: localTimeZone,
    })
    return formatter.format(d)
  }

  const timeOnly = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: localTimeZone,
  }).format(target)

  // Today
  if (getLocalDateParts(target) === getLocalDateParts(now)) {
    return `오늘 ${timeOnly}`
  }

  // Yesterday
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (getLocalDateParts(target) === getLocalDateParts(yesterday)) {
    return `어제 ${timeOnly}`
  }

  // Older dates - full format
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: localTimeZone,
  }).format(target)
}
