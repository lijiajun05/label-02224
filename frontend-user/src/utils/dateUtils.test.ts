/**
 * 日期工具函数单元测试
 * Unit tests for date utility functions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getMonthDays,
  isSameDay,
  isToday,
  formatDate,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getDaysInMonth
} from './dateUtils'

describe('getMonthDays', () => {
  it('should return exactly 42 days for any month', () => {
    // Test multiple months
    const months = [
      { year: 2024, month: 0 },  // January
      { year: 2024, month: 1 },  // February (leap year)
      { year: 2023, month: 1 },  // February (non-leap year)
      { year: 2024, month: 11 }, // December
    ]
    
    months.forEach(({ year, month }) => {
      const days = getMonthDays(year, month)
      expect(days).toHaveLength(42)
    })
  })

  it('should include all days of the current month', () => {
    // January 2024 has 31 days
    const days = getMonthDays(2024, 0)
    const currentMonthDays = days.filter(d => d.isCurrentMonth)
    expect(currentMonthDays).toHaveLength(31)
  })

  it('should correctly mark current month days', () => {
    const days = getMonthDays(2024, 0) // January 2024
    
    days.forEach(day => {
      if (day.date.getMonth() === 0 && day.date.getFullYear() === 2024) {
        expect(day.isCurrentMonth).toBe(true)
      } else {
        expect(day.isCurrentMonth).toBe(false)
      }
    })
  })

  it('should start with correct day of week', () => {
    // January 2024 starts on Monday (day 1)
    const days = getMonthDays(2024, 0)
    // First day should be from previous month (December 31, 2023 is Sunday)
    // So the grid should start with Sunday Dec 31
    expect(days[0].date.getDay()).toBe(0) // Sunday
  })

  it('should handle February in leap year correctly', () => {
    // 2024 is a leap year, February has 29 days
    const days = getMonthDays(2024, 1)
    const febDays = days.filter(d => d.isCurrentMonth)
    expect(febDays).toHaveLength(29)
  })

  it('should handle February in non-leap year correctly', () => {
    // 2023 is not a leap year, February has 28 days
    const days = getMonthDays(2023, 1)
    const febDays = days.filter(d => d.isCurrentMonth)
    expect(febDays).toHaveLength(28)
  })

  it('should have consecutive dates', () => {
    const days = getMonthDays(2024, 5) // June 2024
    
    for (let i = 1; i < days.length; i++) {
      const prevDate = days[i - 1].date
      const currDate = days[i].date
      const diffMs = currDate.getTime() - prevDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(1)
    }
  })
})

describe('isSameDay', () => {
  it('should return true for same dates', () => {
    const date1 = new Date(2024, 5, 15)
    const date2 = new Date(2024, 5, 15)
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('should return true for same day with different times', () => {
    const date1 = new Date(2024, 5, 15, 10, 30, 0)
    const date2 = new Date(2024, 5, 15, 22, 45, 30)
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('should return false for different days', () => {
    const date1 = new Date(2024, 5, 15)
    const date2 = new Date(2024, 5, 16)
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('should return false for different months', () => {
    const date1 = new Date(2024, 5, 15)
    const date2 = new Date(2024, 6, 15)
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('should return false for different years', () => {
    const date1 = new Date(2024, 5, 15)
    const date2 = new Date(2025, 5, 15)
    expect(isSameDay(date1, date2)).toBe(false)
  })
})

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return true for today', () => {
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
    const today = new Date(2024, 5, 15)
    expect(isToday(today)).toBe(true)
  })

  it('should return true for today with different time', () => {
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
    const todayMorning = new Date(2024, 5, 15, 8, 0, 0)
    expect(isToday(todayMorning)).toBe(true)
  })

  it('should return false for yesterday', () => {
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
    const yesterday = new Date(2024, 5, 14)
    expect(isToday(yesterday)).toBe(false)
  })

  it('should return false for tomorrow', () => {
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
    const tomorrow = new Date(2024, 5, 16)
    expect(isToday(tomorrow)).toBe(false)
  })
})

describe('formatDate', () => {
  const testDate = new Date(2024, 5, 15) // June 15, 2024 (Saturday)

  it('should format YYYY correctly', () => {
    expect(formatDate(testDate, 'YYYY')).toBe('2024')
  })

  it('should format YY correctly', () => {
    expect(formatDate(testDate, 'YY')).toBe('24')
  })

  it('should format MM correctly', () => {
    expect(formatDate(testDate, 'MM')).toBe('06')
  })

  it('should format M correctly', () => {
    expect(formatDate(testDate, 'M')).toBe('6')
  })

  it('should format DD correctly', () => {
    expect(formatDate(testDate, 'DD')).toBe('15')
  })

  it('should format D correctly', () => {
    const singleDigitDay = new Date(2024, 5, 5)
    expect(formatDate(singleDigitDay, 'D')).toBe('5')
  })

  it('should format dddd correctly', () => {
    expect(formatDate(testDate, 'dddd')).toBe('Saturday')
  })

  it('should format ddd correctly', () => {
    expect(formatDate(testDate, 'ddd')).toBe('Sat')
  })

  it('should format dd correctly', () => {
    expect(formatDate(testDate, 'dd')).toBe('Sa')
  })

  it('should format complex patterns correctly', () => {
    expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2024-06-15')
    expect(formatDate(testDate, 'YYYY/M/D')).toBe('2024/6/15')
    expect(formatDate(testDate, 'dddd, YYYY年MM月DD日')).toBe('Saturday, 2024年06月15日')
  })

  it('should handle all weekdays correctly', () => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    for (let i = 0; i < 7; i++) {
      // June 16, 2024 is Sunday, so we can iterate from there
      const date = new Date(2024, 5, 16 + i)
      expect(formatDate(date, 'dddd')).toBe(weekdays[i])
    }
  })
})

describe('getFirstDayOfMonth', () => {
  it('should return the first day of the month', () => {
    const firstDay = getFirstDayOfMonth(2024, 5) // June 2024
    expect(firstDay.getFullYear()).toBe(2024)
    expect(firstDay.getMonth()).toBe(5)
    expect(firstDay.getDate()).toBe(1)
  })
})

describe('getLastDayOfMonth', () => {
  it('should return the last day of the month', () => {
    const lastDay = getLastDayOfMonth(2024, 5) // June 2024
    expect(lastDay.getFullYear()).toBe(2024)
    expect(lastDay.getMonth()).toBe(5)
    expect(lastDay.getDate()).toBe(30)
  })

  it('should handle months with 31 days', () => {
    const lastDay = getLastDayOfMonth(2024, 0) // January 2024
    expect(lastDay.getDate()).toBe(31)
  })

  it('should handle February in leap year', () => {
    const lastDay = getLastDayOfMonth(2024, 1) // February 2024 (leap year)
    expect(lastDay.getDate()).toBe(29)
  })

  it('should handle February in non-leap year', () => {
    const lastDay = getLastDayOfMonth(2023, 1) // February 2023 (non-leap year)
    expect(lastDay.getDate()).toBe(28)
  })
})

describe('getDaysInMonth', () => {
  it('should return correct days for each month', () => {
    // 2024 is a leap year
    const expectedDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    expectedDays.forEach((expected, month) => {
      expect(getDaysInMonth(2024, month)).toBe(expected)
    })
  })

  it('should return 28 for February in non-leap year', () => {
    expect(getDaysInMonth(2023, 1)).toBe(28)
  })
})
