/**
 * CalendarView.vue 组件测试
 * Tests for CalendarView component
 * 
 * 需求: 1.1, 1.2, 1.3, 4.2, 4.3
 * - 1.1: 以月视图形式展示当前月份的所有日期
 * - 1.2: 高亮选中的日期并显示该日期的详细信息
 * - 1.3: 使用卷轴展开动效切换到目标月份
 * - 4.2: 采用卡片式布局呈现日期信息
 * - 4.3: 使用仿古卷轴展开效果作为过渡动画
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import CalendarView from './CalendarView.vue'
import CalendarCell from './CalendarCell.vue'
import type { CalendarViewProps } from '../types'

// Helper function to mount component
function mountCalendarView(props: Partial<CalendarViewProps> = {}) {
  const defaultProps: CalendarViewProps = {
    currentDate: new Date(2024, 1, 15), // Feb 15, 2024
    selectedDate: new Date(2024, 1, 15),
    ...props
  }
  
  return mount(CalendarView, {
    props: defaultProps as any,
    global: {
      stubs: {
        CalendarCell: false
      }
    }
  })
}

describe('CalendarView', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  /**
   * 需求 1.1: 以月视图形式展示当前月份的所有日期
   */
  describe('月视图显示 (Month View Display)', () => {
    it('should render the calendar view container', () => {
      wrapper = mountCalendarView()
      
      const calendarView = wrapper.find('[data-testid="calendar-view"]')
      expect(calendarView.exists()).toBe(true)
    })

    it('should display the month title', () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15) // February 2024
      })
      
      const monthTitle = wrapper.find('[data-testid="month-title"]')
      expect(monthTitle.exists()).toBe(true)
      expect(monthTitle.text()).toBe('2024年2月')
    })

    it('should display weekday headers', () => {
      wrapper = mountCalendarView()
      
      const weekdayHeaders = wrapper.find('[data-testid="weekday-headers"]')
      expect(weekdayHeaders.exists()).toBe(true)
      
      const weekdays = ['日', '一', '二', '三', '四', '五', '六']
      weekdays.forEach(day => {
        expect(weekdayHeaders.text()).toContain(day)
      })
    })

    it('should render the calendar grid', () => {
      wrapper = mountCalendarView()
      
      const grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should render CalendarCell components in the grid', () => {
      wrapper = mountCalendarView()
      
      const cells = wrapper.findAllComponents(CalendarCell)
      // Calendar grid should have 42 cells (6 rows x 7 columns)
      expect(cells.length).toBe(42)
    })

    it('should display different months correctly', () => {
      const testCases = [
        { date: new Date(2024, 0, 1), expected: '2024年1月' },
        { date: new Date(2024, 5, 15), expected: '2024年6月' },
        { date: new Date(2024, 11, 25), expected: '2024年12月' }
      ]
      
      testCases.forEach(({ date, expected }) => {
        const testWrapper = mountCalendarView({ currentDate: date })
        const monthTitle = testWrapper.find('[data-testid="month-title"]')
        expect(monthTitle.text()).toBe(expected)
        testWrapper.unmount()
      })
    })
  })

  /**
   * 月份导航测试
   */
  describe('月份导航 (Month Navigation)', () => {
    it('should render previous month button', () => {
      wrapper = mountCalendarView()
      
      const prevBtn = wrapper.find('[data-testid="prev-month-btn"]')
      expect(prevBtn.exists()).toBe(true)
      expect(prevBtn.attributes('aria-label')).toBe('上一月')
    })

    it('should render next month button', () => {
      wrapper = mountCalendarView()
      
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      expect(nextBtn.exists()).toBe(true)
      expect(nextBtn.attributes('aria-label')).toBe('下一月')
    })

    it('should navigate to previous month when prev button is clicked', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15) // February 2024
      })
      
      const prevBtn = wrapper.find('[data-testid="prev-month-btn"]')
      await prevBtn.trigger('click')
      
      const monthTitle = wrapper.find('[data-testid="month-title"]')
      expect(monthTitle.text()).toBe('2024年1月')
    })

    it('should navigate to next month when next button is clicked', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15) // February 2024
      })
      
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      await nextBtn.trigger('click')
      
      const monthTitle = wrapper.find('[data-testid="month-title"]')
      expect(monthTitle.text()).toBe('2024年3月')
    })

    it('should emit monthChange event when navigating to previous month', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15)
      })
      
      const prevBtn = wrapper.find('[data-testid="prev-month-btn"]')
      await prevBtn.trigger('click')
      
      expect(wrapper.emitted('monthChange')).toBeTruthy()
      expect(wrapper.emitted('monthChange')!.length).toBe(1)
    })

    it('should emit monthChange event when navigating to next month', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15)
      })
      
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      await nextBtn.trigger('click')
      
      expect(wrapper.emitted('monthChange')).toBeTruthy()
      expect(wrapper.emitted('monthChange')!.length).toBe(1)
    })

    it('should handle year boundary when navigating from January to December', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 0, 15) // January 2024
      })
      
      const prevBtn = wrapper.find('[data-testid="prev-month-btn"]')
      await prevBtn.trigger('click')
      
      const monthTitle = wrapper.find('[data-testid="month-title"]')
      expect(monthTitle.text()).toBe('2023年12月')
    })

    it('should handle year boundary when navigating from December to January', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 11, 15) // December 2024
      })
      
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      await nextBtn.trigger('click')
      
      const monthTitle = wrapper.find('[data-testid="month-title"]')
      expect(monthTitle.text()).toBe('2025年1月')
    })
  })

  /**
   * 需求 1.2: 高亮选中的日期
   */
  describe('日期选择 (Date Selection)', () => {
    it('should emit select event when a date is clicked', async () => {
      wrapper = mountCalendarView()
      
      const cells = wrapper.findAllComponents(CalendarCell)
      // Click on a cell
      await cells[15].trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('should pass isSelected prop to the selected date cell', () => {
      const selectedDate = new Date(2024, 1, 15)
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 1),
        selectedDate
      })
      
      const cells = wrapper.findAllComponents(CalendarCell)
      // Find the cell with the selected date
      const selectedCell = cells.find(cell => {
        const props = cell.props()
        return props.date.getDate() === 15 && 
               props.date.getMonth() === 1 &&
               props.isCurrentMonth === true
      })
      
      expect(selectedCell).toBeDefined()
      expect(selectedCell!.props('isSelected')).toBe(true)
    })
  })

  /**
   * 需求 1.3, 4.3: 卷轴展开动效
   */
  describe('卷轴展开动效 (Scroll Unfold Animation)', () => {
    it('should apply animation class when navigating months', async () => {
      wrapper = mountCalendarView()
      
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      await nextBtn.trigger('click')
      
      const grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.classes()).toContain('calendar-view__grid--animating')
    })

    it('should remove animation class after animation completes', async () => {
      vi.useFakeTimers()
      wrapper = mountCalendarView()
      
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      await nextBtn.trigger('click')
      
      // Animation should be active
      let grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.classes()).toContain('calendar-view__grid--animating')
      
      // Fast forward past animation duration (500ms)
      vi.advanceTimersByTime(600)
      await wrapper.vm.$nextTick()
      
      grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.classes()).not.toContain('calendar-view__grid--animating')
      
      vi.useRealTimers()
    })

    it('should trigger animation on prev month navigation', async () => {
      wrapper = mountCalendarView()
      
      const prevBtn = wrapper.find('[data-testid="prev-month-btn"]')
      await prevBtn.trigger('click')
      
      const grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.classes()).toContain('calendar-view__grid--animating')
    })
  })

  /**
   * 需求 4.2: 卡片式布局
   */
  describe('卡片式布局 (Card Layout)', () => {
    it('should have card styling classes', () => {
      wrapper = mountCalendarView()
      
      const calendarView = wrapper.find('[data-testid="calendar-view"]')
      expect(calendarView.classes()).toContain('calendar-view')
    })

    it('should have header section', () => {
      wrapper = mountCalendarView()
      
      const header = wrapper.find('[data-testid="calendar-header"]')
      expect(header.exists()).toBe(true)
    })
  })

  /**
   * 无障碍访问测试
   */
  describe('无障碍访问 (Accessibility)', () => {
    it('should have role="grid" on calendar grid', () => {
      wrapper = mountCalendarView()
      
      const grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.attributes('role')).toBe('grid')
    })

    it('should have aria-label on calendar grid', () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15)
      })
      
      const grid = wrapper.find('[data-testid="calendar-grid"]')
      expect(grid.attributes('aria-label')).toBe('2024年2月日历')
    })

    it('should have role="row" on weekday headers', () => {
      wrapper = mountCalendarView()
      
      const weekdayHeaders = wrapper.find('[data-testid="weekday-headers"]')
      expect(weekdayHeaders.attributes('role')).toBe('row')
    })

    it('should have role="columnheader" on each weekday', () => {
      wrapper = mountCalendarView()
      
      const weekdayHeaders = wrapper.find('[data-testid="weekday-headers"]')
      const weekdays = weekdayHeaders.findAll('[role="columnheader"]')
      expect(weekdays.length).toBe(7)
    })

    it('should have accessible navigation buttons', () => {
      wrapper = mountCalendarView()
      
      const prevBtn = wrapper.find('[data-testid="prev-month-btn"]')
      const nextBtn = wrapper.find('[data-testid="next-month-btn"]')
      
      expect(prevBtn.attributes('type')).toBe('button')
      expect(nextBtn.attributes('type')).toBe('button')
      expect(prevBtn.attributes('aria-label')).toBeTruthy()
      expect(nextBtn.attributes('aria-label')).toBeTruthy()
    })
  })

  /**
   * Props 同步测试
   */
  describe('Props 同步 (Props Synchronization)', () => {
    it('should update month when currentDate prop changes', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 15)
      })
      
      expect(wrapper.find('[data-testid="month-title"]').text()).toBe('2024年2月')
      
      await wrapper.setProps({ currentDate: new Date(2024, 5, 15) })
      
      expect(wrapper.find('[data-testid="month-title"]').text()).toBe('2024年6月')
    })

    it('should update selected date when selectedDate prop changes', async () => {
      wrapper = mountCalendarView({
        currentDate: new Date(2024, 1, 1),
        selectedDate: new Date(2024, 1, 10)
      })
      
      // Find cell with date 10
      let cells = wrapper.findAllComponents(CalendarCell)
      let cell10 = cells.find(c => c.props('date').getDate() === 10 && c.props('isCurrentMonth'))
      expect(cell10!.props('isSelected')).toBe(true)
      
      // Change selected date
      await wrapper.setProps({ selectedDate: new Date(2024, 1, 20) })
      
      cells = wrapper.findAllComponents(CalendarCell)
      const cell20 = cells.find(c => c.props('date').getDate() === 20 && c.props('isCurrentMonth'))
      cell10 = cells.find(c => c.props('date').getDate() === 10 && c.props('isCurrentMonth'))
      
      expect(cell20!.props('isSelected')).toBe(true)
      expect(cell10!.props('isSelected')).toBe(false)
    })
  })
})
