/**
 * useAlmanac 组合式函数
 * Almanac composable for managing almanac drawer state and data
 * 
 * 需求: 2.1, 2.6
 * - 2.1: 用户点击黄历按钮或从右侧边缘滑动时，抽屉从侧边滑出
 * - 2.6: 用户在日历视图中切换选中日期时，黄历自动更新为新选中日期的信息
 */

import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { AlmanacData, UseAlmanacReturn } from '../types'
import { getAlmanacData } from '../services/almanacService'

/**
 * 黄历组合式函数
 * Composable for almanac drawer state and data management
 * 
 * @param selectedDate - 选中的日期（来自 useCalendar）
 * @returns UseAlmanacReturn - 黄历状态和操作方法
 */
export function useAlmanac(selectedDate: Ref<Date>): UseAlmanacReturn {
  // 抽屉开关状态
  const isDrawerOpen: Ref<boolean> = ref(false)
  
  /**
   * 根据选中日期计算黄历数据
   * Compute almanac data based on selected date
   * 
   * 验证: 需求 2.6 - 自动更新为新选中日期的黄历信息
   */
  const almanacData: ComputedRef<AlmanacData | null> = computed(() => {
    if (!selectedDate.value) {
      return null
    }
    return getAlmanacData(selectedDate.value)
  })
  
  /**
   * 打开黄历抽屉
   * Open the almanac drawer
   * 
   * 验证: 需求 2.1 - 以抽屉形式从侧边滑出
   */
  function openDrawer(): void {
    isDrawerOpen.value = true
  }
  
  /**
   * 关闭黄历抽屉
   * Close the almanac drawer
   */
  function closeDrawer(): void {
    isDrawerOpen.value = false
  }
  
  return {
    almanacData,
    isDrawerOpen,
    openDrawer,
    closeDrawer
  }
}
