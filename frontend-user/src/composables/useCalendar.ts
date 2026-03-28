/**
 * useCalendar 组合式函数
 * Calendar composable for managing calendar state and navigation
 * 
 * 需求: 1.1, 1.2, 1.3
 * - 1.1: 以月视图形式展示当前月份的所有日期
 * - 1.2: 高亮选中的日期并显示该日期的详细信息
 * - 1.3: 使用卷轴展开动效切换到目标月份
 */

import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { CalendarDay, UseCalendarReturn } from '../types'
import { getMonthDays, isToday } from '../utils/dateUtils'
import { solarToLunar, getFestival, getSolarTerm } from '../services/lunarService'

/**
 * 日历组合式函数
 * Composable for calendar state management
 * 
 * @returns UseCalendarReturn - 日历状态和操作方法
 */
export function useCalendar(): UseCalendarReturn {
  // 当前月份（用于显示月视图）
  const currentMonth: Ref<Date> = ref(new Date())
  
  // 选中的日期
  const selectedDate: Ref<Date> = ref(new Date())
  
  /**
   * 计算日历网格数据
   * Compute calendar days with lunar date, festival, and solar term info
   */
  const calendarDays: ComputedRef<CalendarDay[]> = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    
    // 获取月份日期网格
    const monthDays = getMonthDays(year, month)
    
    // 丰富每个日期的信息
    return monthDays.map((day) => {
      const lunarDate = solarToLunar(day.date)
      const festival = getFestival(day.date, lunarDate)
      const solarTerm = getSolarTerm(day.date)
      
      return {
        date: day.date,
        lunarDate,
        isToday: isToday(day.date),
        isCurrentMonth: day.isCurrentMonth,
        festival,
        solarTerm
      }
    })
  })
  
  /**
   * 选择日期
   * Select a date
   * 
   * @param date - 要选择的日期
   */
  function selectDate(date: Date): void {
    selectedDate.value = new Date(date)
  }
  
  /**
   * 切换到下一个月
   * Navigate to next month
   */
  function nextMonth(): void {
    const current = currentMonth.value
    currentMonth.value = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  }
  
  /**
   * 切换到上一个月
   * Navigate to previous month
   */
  function prevMonth(): void {
    const current = currentMonth.value
    currentMonth.value = new Date(current.getFullYear(), current.getMonth() - 1, 1)
  }
  
  return {
    currentMonth,
    selectedDate,
    calendarDays,
    selectDate,
    nextMonth,
    prevMonth
  }
}
