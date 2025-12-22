import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from '../time-utils'

describe('formatRelativeTime', () => {
  // Use a fixed "now" for predictable testing
  const now = new Date('2024-06-15T14:30:00')

  it('should show seconds for times less than 1 minute ago', () => {
    const date30SecondsAgo = new Date(now.getTime() - 30 * 1000)
    expect(formatRelativeTime(date30SecondsAgo, now)).toBe('30초전')
  })

  it('should show at least 1 second for very recent times', () => {
    const dateJustNow = new Date(now.getTime() - 100) // 100ms ago
    expect(formatRelativeTime(dateJustNow, now)).toBe('1초전')
  })

  it('should show minutes for times less than 1 hour ago', () => {
    const date5MinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    expect(formatRelativeTime(date5MinutesAgo, now)).toBe('5분전')

    const date59MinutesAgo = new Date(now.getTime() - 59 * 60 * 1000)
    expect(formatRelativeTime(date59MinutesAgo, now)).toBe('59분전')
  })

  it('should show at least 1 minute for times just over 1 minute ago', () => {
    const date61SecondsAgo = new Date(now.getTime() - 61 * 1000)
    expect(formatRelativeTime(date61SecondsAgo, now)).toBe('1분전')
  })

  it('should show "오늘 HH:MM" for today beyond 1 hour', () => {
    // 2 hours ago on the same day
    const date2HoursAgo = new Date('2024-06-15T12:30:00')
    const result = formatRelativeTime(date2HoursAgo, now)
    expect(result).toMatch(/^오늘 12:30$/)
  })

  it('should show "어제 HH:MM" for yesterday', () => {
    const yesterday = new Date('2024-06-14T18:45:00')
    const result = formatRelativeTime(yesterday, now)
    expect(result).toMatch(/^어제 18:45$/)
  })

  it('should show full date format for older dates', () => {
    const oldDate = new Date('2024-06-01T09:15:00')
    const result = formatRelativeTime(oldDate, now)
    // Format: "2024. 06. 01. 09:15"
    expect(result).toMatch(/2024\.\s*0?6\.\s*0?1\.?\s+09:15/)
  })

  it('should show full format for future dates', () => {
    const futureDate = new Date('2024-06-20T10:00:00')
    const result = formatRelativeTime(futureDate, now)
    // Should show full format for future dates
    expect(result).toMatch(/2024/)
  })

  it('should handle exact boundary: 59 seconds', () => {
    const date59SecondsAgo = new Date(now.getTime() - 59 * 1000)
    expect(formatRelativeTime(date59SecondsAgo, now)).toBe('59초전')
  })

  it('should handle exact boundary: 60 seconds (1 minute)', () => {
    const date60SecondsAgo = new Date(now.getTime() - 60 * 1000)
    expect(formatRelativeTime(date60SecondsAgo, now)).toBe('1분전')
  })
})
