/**
 * useCalendar 组合式函数测试
 * Tests for the useCalendar composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCalendar } from './useCalendar'

describe('useCalendar', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize currentMonth with current date', () => {
      const { currentMonth } = useCalendar()
      const now = new Date()
      
      expect(currentMonth.value.getFullYear()).toBe(now.getFullYear())
      expect(currentMonth.value.getMonth()).toBe(now.getMonth())
    })

    it('should initialize selectedDate with current date', () => {
      const { selectedDate } = useCalendar()
      const now = new Date()
      
      expect(selectedDate.value.getFullYear()).toBe(now.getFullYear())
      expect(selectedDate.value.getMonth()).toBe(now.getMonth())
      expect(selectedDate.value.getDate()).toBe(now.getDate())
    })
  })

  describe('calendarDays', () => {
    it('should return 42 days for the calendar grid', () => {
      const { calendarDays } = useCalendar()
      
      expect(calendarDays.value).toHaveLength(42)
    })

    it('should include days from current month', () => {
      const { calendarDays } = useCalendar()
      const currentMonthDays = calendarDays.value.filter(day => day.isCurrentMonth)
      
      // Current month should have between 28-31 days
      expect(currentMonthDays.length).toBeGreaterThanOrEqual(28)
      expect(currentMonthDays.length).toBeLessThanOrEqual(31)
    })

    it('should include lunar date for each day', () => {
      const { calendarDays } = useCalendar()
      
      calendarDays.value.forEach(day => {
        expect(day.lunarDate).toBeDefined()
        expect(day.lunarDate.year).toBeGreaterThan(0)
        expect(day.lunarDate.month).toBeGreaterThanOrEqual(1)
        expect(day.lunarDate.month).toBeLessThanOrEqual(12)
        expect(day.lunarDate.day).toBeGreaterThanOrEqual(1)
        expect(day.lunarDate.day).toBeLessThanOrEqual(30)
        expect(day.lunarDate.dayCn).toBeDefined()
        expect(day.lunarDate.monthCn).toBeDefined()
        expect(day.lunarDate.yearCn).toBeDefined()
      })
    })

    it('should mark today correctly', () => {
      const { calendarDays } = useCalendar()
      const today = new Date()
      
      const todayInCalendar = calendarDays.value.find(day => 
        day.date.getFullYear() === today.getFullYear() &&
        day.date.getMonth() === today.getMonth() &&
        day.date.getDate() === today.getDate()
      )
      
      expect(todayInCalendar?.isToday).toBe(true)
    })

    it('should update when currentMonth changes', () => {
      const { calendarDays, nextMonth } = useCalendar()
      
      const initialFirstDay = calendarDays.value[0].date.getTime()
      
      nextMonth()
      
      const newFirstDay = calendarDays.value[0].date.getTime()
      
      expect(newFirstDay).not.toBe(initialFirstDay)
    })
  })

  describe('selectDate', () => {
    it('should update selectedDate when selectDate is called', () => {
      const { selectedDate, selectDate } = useCalendar()
      const newDate = new Date(2024, 5, 15) // June 15, 2024
      
      selectDate(newDate)
      
      expect(selectedDate.value.getFullYear()).toBe(2024)
      expect(selectedDate.value.getMonth()).toBe(5)
      expect(selectedDate.value.getDate()).toBe(15)
    })

    it('should create a new Date object to avoid reference issues', () => {
      const { selectedDate, selectDate } = useCalendar()
      const newDate = new Date(2024, 5, 15)
      
      selectDate(newDate)
      
      // Modify the original date
      newDate.setDate(20)
      
      // selectedDate should not be affected
      expect(selectedDate.value.getDate()).toBe(15)
    })
  })

  describe('nextMonth', () => {
    it('should advance currentMonth by one month', () => {
      const { currentMonth, nextMonth } = useCalendar()
      const initialMonth = currentMonth.value.getMonth()
      const initialYear = currentMonth.value.getFullYear()
      
      nextMonth()
      
      const expectedMonth = (initialMonth + 1) % 12
      const expectedYear = initialMonth === 11 ? initialYear + 1 : initialYear
      
      expect(currentMonth.value.getMonth()).toBe(expectedMonth)
      expect(currentMonth.value.getFullYear()).toBe(expectedYear)
    })

    it('should handle year transition (December to January)', () => {
      const calendar = useCalendar()
      
      // Set to December
      calendar.currentMonth.value = new Date(2024, 11, 1)
      
      calendar.nextMonth()
      
      expect(calendar.currentMonth.value.getMonth()).toBe(0) // January
      expect(calendar.currentMonth.value.getFullYear()).toBe(2025)
    })
  })

  describe('prevMonth', () => {
    it('should go back one month', () => {
      const { currentMonth, prevMonth } = useCalendar()
      const initialMonth = currentMonth.value.getMonth()
      const initialYear = currentMonth.value.getFullYear()
      
      prevMonth()
      
      const expectedMonth = initialMonth === 0 ? 11 : initialMonth - 1
      const expectedYear = initialMonth === 0 ? initialYear - 1 : initialYear
      
      expect(currentMonth.value.getMonth()).toBe(expectedMonth)
      expect(currentMonth.value.getFullYear()).toBe(expectedYear)
    })

    it('should handle year transition (January to December)', () => {
      const calendar = useCalendar()
      
      // Set to January
      calendar.currentMonth.value = new Date(2024, 0, 1)
      
      calendar.prevMonth()
      
      expect(calendar.currentMonth.value.getMonth()).toBe(11) // December
      expect(calendar.currentMonth.value.getFullYear()).toBe(2023)
    })
  })

  describe('month navigation integration', () => {
    it('should allow navigating forward and backward', () => {
      const { currentMonth, nextMonth, prevMonth } = useCalendar()
      const initialMonth = currentMonth.value.getMonth()
      const initialYear = currentMonth.value.getFullYear()
      
      // Go forward 3 months
      nextMonth()
      nextMonth()
      nextMonth()
      
      // Go back 3 months
      prevMonth()
      prevMonth()
      prevMonth()
      
      expect(currentMonth.value.getMonth()).toBe(initialMonth)
      expect(currentMonth.value.getFullYear()).toBe(initialYear)
    })
  })
})
