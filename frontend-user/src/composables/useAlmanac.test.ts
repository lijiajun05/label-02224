/**
 * useAlmanac 组合式函数测试
 * Tests for the useAlmanac composable
 * 
 * 需求: 2.1, 2.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useAlmanac } from './useAlmanac'

describe('useAlmanac', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize isDrawerOpen as false', () => {
      const selectedDate = ref(new Date())
      const { isDrawerOpen } = useAlmanac(selectedDate)
      
      expect(isDrawerOpen.value).toBe(false)
    })

    it('should compute almanacData based on selectedDate', () => {
      const selectedDate = ref(new Date(2024, 5, 15)) // June 15, 2024
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value).not.toBeNull()
      expect(almanacData.value?.date.getFullYear()).toBe(2024)
      expect(almanacData.value?.date.getMonth()).toBe(5)
      expect(almanacData.value?.date.getDate()).toBe(15)
    })
  })

  describe('almanacData', () => {
    it('should include lunarDate in almanacData', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.lunarDate).toBeDefined()
      expect(almanacData.value?.lunarDate.year).toBeGreaterThan(0)
      expect(almanacData.value?.lunarDate.month).toBeGreaterThanOrEqual(1)
      expect(almanacData.value?.lunarDate.day).toBeGreaterThanOrEqual(1)
    })

    it('should include ganZhi in almanacData', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.ganZhi).toBeDefined()
      expect(almanacData.value?.ganZhi.year).toBeDefined()
      expect(almanacData.value?.ganZhi.month).toBeDefined()
      expect(almanacData.value?.ganZhi.day).toBeDefined()
    })

    it('should include suitable activities', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.suitable).toBeDefined()
      expect(Array.isArray(almanacData.value?.suitable)).toBe(true)
      expect(almanacData.value?.suitable.length).toBeGreaterThan(0)
    })

    it('should include avoid activities', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.avoid).toBeDefined()
      expect(Array.isArray(almanacData.value?.avoid)).toBe(true)
      expect(almanacData.value?.avoid.length).toBeGreaterThan(0)
    })

    it('should include luckyHours', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.luckyHours).toBeDefined()
      expect(Array.isArray(almanacData.value?.luckyHours)).toBe(true)
      expect(almanacData.value?.luckyHours.length).toBeGreaterThan(0)
    })

    it('should include fiveElements', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.fiveElements).toBeDefined()
      expect(typeof almanacData.value?.fiveElements).toBe('string')
    })

    it('should include clash info', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      expect(almanacData.value?.clash).toBeDefined()
      expect(typeof almanacData.value?.clash).toBe('string')
    })

    /**
     * 验证: 需求 2.6 - 用户在日历视图中切换选中日期时，黄历自动更新
     */
    it('should update almanacData when selectedDate changes', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData } = useAlmanac(selectedDate)
      
      const initialDate = almanacData.value?.date.getDate()
      
      // Change selected date
      selectedDate.value = new Date(2024, 5, 20)
      
      expect(almanacData.value?.date.getDate()).toBe(20)
      expect(almanacData.value?.date.getDate()).not.toBe(initialDate)
    })

    it('should compute different almanacData for different dates', () => {
      const selectedDate = ref(new Date(2024, 0, 1)) // Jan 1, 2024
      const { almanacData } = useAlmanac(selectedDate)
      
      const jan1Data = { ...almanacData.value }
      
      selectedDate.value = new Date(2024, 6, 15) // July 15, 2024
      
      // Different dates should have different lunar dates
      expect(almanacData.value?.lunarDate.month).not.toBe(jan1Data.lunarDate?.month)
    })
  })

  describe('openDrawer', () => {
    /**
     * 验证: 需求 2.1 - 用户点击黄历按钮时，抽屉从侧边滑出
     */
    it('should set isDrawerOpen to true', () => {
      const selectedDate = ref(new Date())
      const { isDrawerOpen, openDrawer } = useAlmanac(selectedDate)
      
      expect(isDrawerOpen.value).toBe(false)
      
      openDrawer()
      
      expect(isDrawerOpen.value).toBe(true)
    })

    it('should remain true if called multiple times', () => {
      const selectedDate = ref(new Date())
      const { isDrawerOpen, openDrawer } = useAlmanac(selectedDate)
      
      openDrawer()
      openDrawer()
      openDrawer()
      
      expect(isDrawerOpen.value).toBe(true)
    })
  })

  describe('closeDrawer', () => {
    it('should set isDrawerOpen to false', () => {
      const selectedDate = ref(new Date())
      const { isDrawerOpen, openDrawer, closeDrawer } = useAlmanac(selectedDate)
      
      openDrawer()
      expect(isDrawerOpen.value).toBe(true)
      
      closeDrawer()
      expect(isDrawerOpen.value).toBe(false)
    })

    it('should remain false if called when already closed', () => {
      const selectedDate = ref(new Date())
      const { isDrawerOpen, closeDrawer } = useAlmanac(selectedDate)
      
      closeDrawer()
      closeDrawer()
      
      expect(isDrawerOpen.value).toBe(false)
    })
  })

  describe('drawer toggle integration', () => {
    it('should allow opening and closing drawer multiple times', () => {
      const selectedDate = ref(new Date())
      const { isDrawerOpen, openDrawer, closeDrawer } = useAlmanac(selectedDate)
      
      expect(isDrawerOpen.value).toBe(false)
      
      openDrawer()
      expect(isDrawerOpen.value).toBe(true)
      
      closeDrawer()
      expect(isDrawerOpen.value).toBe(false)
      
      openDrawer()
      expect(isDrawerOpen.value).toBe(true)
      
      closeDrawer()
      expect(isDrawerOpen.value).toBe(false)
    })

    it('should maintain almanacData when drawer is toggled', () => {
      const selectedDate = ref(new Date(2024, 5, 15))
      const { almanacData, openDrawer, closeDrawer } = useAlmanac(selectedDate)
      
      const initialData = almanacData.value
      
      openDrawer()
      expect(almanacData.value).toEqual(initialData)
      
      closeDrawer()
      expect(almanacData.value).toEqual(initialData)
    })
  })
})
