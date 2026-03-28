/**
 * 日期工具函数
 * Date utility functions for the Zen Calendar App
 */

/**
 * 月份日期网格中的日期信息
 * Date info in the month grid
 */
export interface MonthGridDay {
  date: Date
  isCurrentMonth: boolean
}

/**
 * 获取月份日期网格
 * Get all days for a month grid (6 rows x 7 columns = 42 days)
 * Includes padding days from previous and next month to fill the grid
 * 
 * @param year - 年份
 * @param month - 月份 (0-11, 0 = January)
 * @returns 包含42天的日期网格数组
 */
export function getMonthDays(year: number, month: number): MonthGridDay[] {
  const result: MonthGridDay[] = []
  
  // Get the first day of the month
  const firstDayOfMonth = new Date(year, month, 1)
  
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayWeekday = firstDayOfMonth.getDay()
  
  // Get the last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayWeekday
  
  // Get the last day of previous month
  const lastDayOfPrevMonth = new Date(year, month, 0)
  const daysInPrevMonth = lastDayOfPrevMonth.getDate()
  
  // Add days from previous month
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    result.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false
    })
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    result.push({
      date: new Date(year, month, day),
      isCurrentMonth: true
    })
  }
  
  // Add days from next month to fill the 6x7 grid (42 days total)
  const remainingDays = 42 - result.length
  for (let day = 1; day <= remainingDays; day++) {
    result.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false
    })
  }
  
  return result
}

/**
 * 比较两个日期是否为同一天
 * Compare if two dates are the same day (ignoring time)
 * 
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns 如果是同一天返回 true
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * 检查日期是否为今天
 * Check if a date is today
 * 
 * @param date - 要检查的日期
 * @returns 如果是今天返回 true
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * 格式化日期为字符串
 * Format date to string based on format pattern
 * 
 * Supported format tokens:
 * - YYYY: 4-digit year (2024)
 * - YY: 2-digit year (24)
 * - MM: 2-digit month (01-12)
 * - M: month without leading zero (1-12)
 * - DD: 2-digit day (01-31)
 * - D: day without leading zero (1-31)
 * - dddd: full weekday name (Sunday-Saturday)
 * - ddd: abbreviated weekday name (Sun-Sat)
 * - dd: 2-letter weekday (Su-Sa)
 * 
 * @param date - 要格式化的日期
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = date.getDay()
  
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const weekdayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdayNamesTiny = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  const padZero = (num: number): string => num.toString().padStart(2, '0')
  
  let result = format
  
  // Replace tokens (order matters - longer tokens first)
  result = result.replace(/YYYY/g, year.toString())
  result = result.replace(/YY/g, year.toString().slice(-2))
  result = result.replace(/MM/g, padZero(month))
  result = result.replace(/M/g, month.toString())
  result = result.replace(/DD/g, padZero(day))
  result = result.replace(/D/g, day.toString())
  result = result.replace(/dddd/g, weekdayNames[weekday])
  result = result.replace(/ddd/g, weekdayNamesShort[weekday])
  result = result.replace(/dd/g, weekdayNamesTiny[weekday])
  
  return result
}

/**
 * 获取月份的第一天
 * Get the first day of a month
 * 
 * @param year - 年份
 * @param month - 月份 (0-11)
 * @returns 该月第一天的日期
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/**
 * 获取月份的最后一天
 * Get the last day of a month
 * 
 * @param year - 年份
 * @param month - 月份 (0-11)
 * @returns 该月最后一天的日期
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

/**
 * 获取月份的天数
 * Get the number of days in a month
 * 
 * @param year - 年份
 * @param month - 月份 (0-11)
 * @returns 该月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}
