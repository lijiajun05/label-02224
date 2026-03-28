/**
 * CalendarCell.vue 组件测试
 * Tests for CalendarCell component
 * 
 * 需求: 1.4, 1.5, 1.6
 * - 1.4: 同时展示公历日期和对应的农历日期
 * - 1.5: 以特殊样式标识今天的日期
 * - 1.6: 以醒目但不突兀的方式标注节日名称
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CalendarCell from './CalendarCell.vue'
import type { LunarDate, CalendarCellProps } from '../types'

// Helper function to create a mock LunarDate
function createMockLunarDate(overrides: Partial<LunarDate> = {}): LunarDate {
  return {
    year: 2024,
    month: 1,
    day: 15,
    yearCn: '甲辰年',
    monthCn: '正月',
    dayCn: '十五',
    isLeapMonth: false,
    ...overrides
  }
}

// Helper function to mount component with proper typing
function mountCalendarCell(props: Partial<CalendarCellProps> = {}) {
  const defaultProps: CalendarCellProps = {
    date: new Date(2024, 1, 15), // Feb 15, 2024
    lunarDate: createMockLunarDate(),
    isToday: false,
    isSelected: false,
    isCurrentMonth: true,
    ...props
  }
  
  return mount(CalendarCell, {
    props: defaultProps as any
  })
}

describe('CalendarCell', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  /**
   * 需求 1.4: 同时展示公历日期和对应的农历日期
   */
  describe('公历和农历日期显示 (Solar and Lunar Date Display)', () => {
    it('should display the solar date (day number)', () => {
      wrapper = mountCalendarCell({
        date: new Date(2024, 1, 15) // Feb 15
      })
      
      const solarDate = wrapper.find('[data-testid="solar-date"]')
      expect(solarDate.exists()).toBe(true)
      expect(solarDate.text()).toBe('15')
    })

    it('should display the lunar date', () => {
      wrapper = mountCalendarCell({
        lunarDate: createMockLunarDate({ dayCn: '十五' })
      })
      
      const lunarDate = wrapper.find('[data-testid="lunar-date"]')
      expect(lunarDate.exists()).toBe(true)
      expect(lunarDate.text()).toBe('十五')
    })

    it('should display different solar dates correctly', () => {
      const testDates = [1, 10, 28, 31]
      
      testDates.forEach(day => {
        const testWrapper = mountCalendarCell({
          date: new Date(2024, 0, day)
        })
        
        const solarDate = testWrapper.find('[data-testid="solar-date"]')
        expect(solarDate.text()).toBe(String(day))
        testWrapper.unmount()
      })
    })

    it('should display different lunar dates correctly', () => {
      const lunarDays = ['初一', '初十', '十五', '廿一', '三十']
      
      lunarDays.forEach(dayCn => {
        const testWrapper = mountCalendarCell({
          lunarDate: createMockLunarDate({ dayCn })
        })
        
        const lunarDate = testWrapper.find('[data-testid="lunar-date"]')
        expect(lunarDate.text()).toBe(dayCn)
        testWrapper.unmount()
      })
    })
  })

  /**
   * 需求 1.5: 以特殊样式标识今天的日期
   */
  describe('今日样式 (Today Styling)', () => {
    it('should apply today class when isToday is true', () => {
      wrapper = mountCalendarCell({
        isToday: true
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).toContain('calendar-cell--today')
    })

    it('should not apply today class when isToday is false', () => {
      wrapper = mountCalendarCell({
        isToday: false
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).not.toContain('calendar-cell--today')
    })

    it('should apply special styling to solar date when isToday is true', () => {
      wrapper = mountCalendarCell({
        isToday: true
      })
      
      const solarDate = wrapper.find('[data-testid="solar-date"]')
      expect(solarDate.classes()).toContain('calendar-cell__solar--today')
    })

    it('should have aria-current="date" when isToday is true', () => {
      wrapper = mountCalendarCell({
        isToday: true
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.attributes('aria-current')).toBe('date')
    })

    it('should not have aria-current when isToday is false', () => {
      wrapper = mountCalendarCell({
        isToday: false
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.attributes('aria-current')).toBeUndefined()
    })
  })

  /**
   * 需求 1.6: 以醒目但不突兀的方式标注节日名称
   */
  describe('节日标注 (Festival Display)', () => {
    it('should display festival name instead of lunar date when festival is present', () => {
      wrapper = mountCalendarCell({
        festival: '春节',
        lunarDate: createMockLunarDate({ dayCn: '初一' })
      })
      
      const lunarDate = wrapper.find('[data-testid="lunar-date"]')
      expect(lunarDate.text()).toBe('春节')
    })

    it('should apply festival styling when festival is present', () => {
      wrapper = mountCalendarCell({
        festival: '中秋节'
      })
      
      const lunarDate = wrapper.find('[data-testid="lunar-date"]')
      expect(lunarDate.classes()).toContain('calendar-cell__lunar--festival')
    })

    it('should not apply festival styling when festival is not present', () => {
      wrapper = mountCalendarCell({
        festival: undefined
      })
      
      const lunarDate = wrapper.find('[data-testid="lunar-date"]')
      expect(lunarDate.classes()).not.toContain('calendar-cell__lunar--festival')
    })

    it('should display various festivals correctly', () => {
      const festivals = ['春节', '元宵节', '清明', '端午节', '中秋节', '重阳节', '立春', '夏至']
      
      festivals.forEach(festival => {
        const testWrapper = mountCalendarCell({ festival })
        
        const lunarDate = testWrapper.find('[data-testid="lunar-date"]')
        expect(lunarDate.text()).toBe(festival)
        expect(lunarDate.classes()).toContain('calendar-cell__lunar--festival')
        testWrapper.unmount()
      })
    })

    it('should include festival in aria-label when present', () => {
      wrapper = mountCalendarCell({
        date: new Date(2024, 1, 10),
        festival: '春节',
        lunarDate: createMockLunarDate({ monthCn: '正月', dayCn: '初一' })
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      const ariaLabel = cell.attributes('aria-label')
      expect(ariaLabel).toContain('春节')
    })
  })

  /**
   * 选中状态测试
   */
  describe('选中状态 (Selected State)', () => {
    it('should apply selected class when isSelected is true', () => {
      wrapper = mountCalendarCell({
        isSelected: true
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).toContain('calendar-cell--selected')
    })

    it('should not apply selected class when isSelected is false', () => {
      wrapper = mountCalendarCell({
        isSelected: false
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).not.toContain('calendar-cell--selected')
    })

    it('should have aria-pressed="true" when isSelected is true', () => {
      wrapper = mountCalendarCell({
        isSelected: true
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.attributes('aria-pressed')).toBe('true')
    })

    it('should have aria-pressed="false" when isSelected is false', () => {
      wrapper = mountCalendarCell({
        isSelected: false
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.attributes('aria-pressed')).toBe('false')
    })
  })

  /**
   * 非当前月份样式测试
   */
  describe('非当前月份样式 (Other Month Styling)', () => {
    it('should apply other-month class when isCurrentMonth is false', () => {
      wrapper = mountCalendarCell({
        isCurrentMonth: false
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).toContain('calendar-cell--other-month')
    })

    it('should not apply other-month class when isCurrentMonth is true', () => {
      wrapper = mountCalendarCell({
        isCurrentMonth: true
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).not.toContain('calendar-cell--other-month')
    })
  })

  /**
   * 点击事件测试
   */
  describe('点击事件 (Click Event)', () => {
    it('should emit select event with date when clicked', async () => {
      const testDate = new Date(2024, 1, 15)
      wrapper = mountCalendarCell({
        date: testDate
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      await cell.trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([testDate])
    })

    it('should emit select event for other month dates', async () => {
      const testDate = new Date(2024, 0, 31) // Previous month
      wrapper = mountCalendarCell({
        date: testDate,
        isCurrentMonth: false
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      await cell.trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([testDate])
    })
  })

  /**
   * 无障碍访问测试
   */
  describe('无障碍访问 (Accessibility)', () => {
    it('should be a button element', () => {
      wrapper = mountCalendarCell()
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.element.tagName).toBe('BUTTON')
    })

    it('should have type="button" attribute', () => {
      wrapper = mountCalendarCell()
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.attributes('type')).toBe('button')
    })

    it('should have descriptive aria-label', () => {
      wrapper = mountCalendarCell({
        date: new Date(2024, 1, 15),
        lunarDate: createMockLunarDate({ monthCn: '正月', dayCn: '十五' })
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      const ariaLabel = cell.attributes('aria-label')
      expect(ariaLabel).toContain('2024年2月15日')
      expect(ariaLabel).toContain('农历正月十五')
    })
  })

  /**
   * 组合状态测试
   */
  describe('组合状态 (Combined States)', () => {
    it('should handle today + selected state', () => {
      wrapper = mountCalendarCell({
        isToday: true,
        isSelected: true
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).toContain('calendar-cell--today')
      expect(cell.classes()).toContain('calendar-cell--selected')
    })

    it('should handle today + festival state', () => {
      wrapper = mountCalendarCell({
        isToday: true,
        festival: '春节'
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).toContain('calendar-cell--today')
      
      const lunarDate = wrapper.find('[data-testid="lunar-date"]')
      expect(lunarDate.text()).toBe('春节')
      expect(lunarDate.classes()).toContain('calendar-cell__lunar--festival')
    })

    it('should handle other-month + festival state', () => {
      wrapper = mountCalendarCell({
        isCurrentMonth: false,
        festival: '元宵节'
      })
      
      const cell = wrapper.find('[data-testid="calendar-cell"]')
      expect(cell.classes()).toContain('calendar-cell--other-month')
      
      const lunarDate = wrapper.find('[data-testid="lunar-date"]')
      expect(lunarDate.text()).toBe('元宵节')
      expect(lunarDate.classes()).toContain('calendar-cell__lunar--festival')
    })
  })
})
