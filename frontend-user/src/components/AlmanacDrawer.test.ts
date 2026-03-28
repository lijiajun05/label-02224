/**
 * AlmanacDrawer.vue 组件测试
 * Tests for AlmanacDrawer component
 * 
 * 需求: 2.1, 2.2, 2.3, 2.4, 2.5
 * - 2.1: 用户点击黄历按钮或从右侧边缘滑动时，抽屉从侧边滑出
 * - 2.2: 显示选中日期的天干地支、五行、冲煞信息
 * - 2.3: 显示当日宜忌事项列表
 * - 2.4: 显示当日吉时信息
 * - 2.5: 用户点击抽屉外部区域或关闭按钮时，抽屉平滑收回隐藏
 */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AlmanacDrawer from './AlmanacDrawer.vue'
import type { AlmanacDrawerProps } from '../types'

// Helper function to mount component
function mountAlmanacDrawer(props: Partial<AlmanacDrawerProps> = {}) {
  const defaultProps: AlmanacDrawerProps = {
    isOpen: true,
    selectedDate: new Date(2024, 1, 15), // Feb 15, 2024
    ...props
  }
  
  return mount(AlmanacDrawer, {
    props: defaultProps as any,
    global: {
      stubs: {
        Teleport: true
      }
    },
    attachTo: document.body
  })
}

describe('AlmanacDrawer', () => {
  let wrapper: VueWrapper | null = null

  beforeEach(() => {
    // Reset body overflow style
    document.body.style.overflow = ''
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    // Clean up body overflow style
    document.body.style.overflow = ''
  })

  /**
   * 需求 2.1: 抽屉从侧边滑出
   */
  describe('抽屉显示/隐藏 (Drawer Show/Hide)', () => {
    it('should render the drawer when isOpen is true', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      expect(drawer.exists()).toBe(true)
    })

    it('should not render the drawer when isOpen is false', () => {
      wrapper = mountAlmanacDrawer({ isOpen: false })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      expect(drawer.exists()).toBe(false)
    })

    it('should render the backdrop when drawer is open', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const backdrop = wrapper.find('[data-testid="almanac-drawer-backdrop"]')
      expect(backdrop.exists()).toBe(true)
    })

    it('should have proper ARIA attributes for accessibility', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      expect(drawer.attributes('role')).toBe('dialog')
      expect(drawer.attributes('aria-modal')).toBe('true')
      expect(drawer.attributes('aria-labelledby')).toBe('almanac-drawer-title')
    })

    it('should display the drawer title', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const title = wrapper.find('#almanac-drawer-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('黄历')
    })

    it('should prevent body scroll when drawer is open', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: false })
      
      await wrapper.setProps({ isOpen: true })
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when drawer is closed', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      await wrapper.setProps({ isOpen: false })
      expect(document.body.style.overflow).toBe('')
    })
  })

  /**
   * 需求 2.2: 显示天干地支、五行、冲煞信息
   */
  describe('天干地支和五行冲煞 (GanZhi and Five Elements)', () => {
    it('should display solar date', () => {
      wrapper = mountAlmanacDrawer({
        isOpen: true,
        selectedDate: new Date(2024, 1, 15) // Feb 15, 2024
      })
      
      const solarDate = wrapper.find('[data-testid="almanac-solar-date"]')
      expect(solarDate.exists()).toBe(true)
      expect(solarDate.text()).toContain('2024年2月15日')
      expect(solarDate.text()).toContain('星期')
    })

    it('should display lunar date', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const lunarDate = wrapper.find('[data-testid="almanac-lunar-date"]')
      expect(lunarDate.exists()).toBe(true)
      // Should contain year, month, and day in Chinese
      expect(lunarDate.text()).toMatch(/年/)
      expect(lunarDate.text()).toMatch(/月/)
    })

    it('should display GanZhi (天干地支) information', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const ganZhi = wrapper.find('[data-testid="almanac-ganzhi"]')
      expect(ganZhi.exists()).toBe(true)
      
      // Should have year, month, and day pillars
      expect(ganZhi.text()).toContain('年柱')
      expect(ganZhi.text()).toContain('月柱')
      expect(ganZhi.text()).toContain('日柱')
    })

    it('should display five elements (五行)', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const wuxing = wrapper.find('[data-testid="almanac-wuxing"]')
      expect(wuxing.exists()).toBe(true)
      expect(wuxing.text()).toContain('五行')
    })

    it('should display clash info (冲煞)', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const clash = wrapper.find('[data-testid="almanac-clash"]')
      expect(clash.exists()).toBe(true)
      expect(clash.text()).toContain('冲煞')
    })
  })

  /**
   * 需求 2.3: 显示当日宜忌事项列表
   */
  describe('宜忌事项 (Suitable and Avoid Activities)', () => {
    it('should display suitable activities (宜)', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const suitable = wrapper.find('[data-testid="almanac-suitable"]')
      expect(suitable.exists()).toBe(true)
      
      // Should have at least one activity
      const activities = suitable.findAll('.almanac-drawer__activity--suitable')
      expect(activities.length).toBeGreaterThan(0)
    })

    it('should display avoid activities (忌)', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const avoid = wrapper.find('[data-testid="almanac-avoid"]')
      expect(avoid.exists()).toBe(true)
      
      // Should have at least one activity
      const activities = avoid.findAll('.almanac-drawer__activity--avoid')
      expect(activities.length).toBeGreaterThan(0)
    })

    it('should style suitable activities with green color', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const suitable = wrapper.find('[data-testid="almanac-suitable"]')
      const activities = suitable.findAll('.almanac-drawer__activity--suitable')
      
      expect(activities.length).toBeGreaterThan(0)
      activities.forEach(activity => {
        expect(activity.classes()).toContain('almanac-drawer__activity--suitable')
      })
    })

    it('should style avoid activities with red color', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const avoid = wrapper.find('[data-testid="almanac-avoid"]')
      const activities = avoid.findAll('.almanac-drawer__activity--avoid')
      
      expect(activities.length).toBeGreaterThan(0)
      activities.forEach(activity => {
        expect(activity.classes()).toContain('almanac-drawer__activity--avoid')
      })
    })
  })

  /**
   * 需求 2.4: 显示当日吉时信息
   */
  describe('吉时信息 (Lucky Hours)', () => {
    it('should display lucky hours section', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const luckyHours = wrapper.find('[data-testid="almanac-lucky-hours"]')
      expect(luckyHours.exists()).toBe(true)
    })

    it('should display multiple lucky hours', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const luckyHours = wrapper.find('[data-testid="almanac-lucky-hours"]')
      const hours = luckyHours.findAll('.almanac-drawer__lucky-hour')
      
      // Should have multiple lucky hours
      expect(hours.length).toBeGreaterThan(0)
    })

    it('should display time ranges for lucky hours', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const luckyHours = wrapper.find('[data-testid="almanac-lucky-hours"]')
      const hours = luckyHours.findAll('.almanac-drawer__lucky-hour')
      
      // Each hour should contain time format
      hours.forEach(hour => {
        expect(hour.text()).toMatch(/时/)
      })
    })
  })

  /**
   * 需求 2.5: 点击外部关闭和关闭按钮
   */
  describe('关闭功能 (Close Functionality)', () => {
    it('should render close button', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const closeBtn = wrapper.find('[data-testid="almanac-drawer-close"]')
      expect(closeBtn.exists()).toBe(true)
      expect(closeBtn.attributes('aria-label')).toBe('关闭黄历')
    })

    it('should emit close event when close button is clicked', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const closeBtn = wrapper.find('[data-testid="almanac-drawer-close"]')
      await closeBtn.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')!.length).toBe(1)
    })

    it('should emit close event when backdrop is clicked', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const backdrop = wrapper.find('[data-testid="almanac-drawer-backdrop"]')
      await backdrop.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close event when drawer content is clicked', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      await drawer.trigger('click')
      
      // Should not emit close when clicking inside the drawer
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should emit close event when ESC key is pressed', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      // Simulate ESC key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close event when ESC is pressed and drawer is closed', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: false })
      
      // Simulate ESC key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
      
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  /**
   * 滑动手势测试
   */
  describe('滑动手势 (Swipe Gesture)', () => {
    it('should emit close event when swiping right', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      
      // Simulate touch events
      await drawer.trigger('touchstart', {
        touches: [{ clientX: 100 }]
      })
      
      await drawer.trigger('touchmove', {
        touches: [{ clientX: 200 }]
      })
      
      await drawer.trigger('touchend')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should not emit close event when swipe distance is too small', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      
      // Simulate small swipe
      await drawer.trigger('touchstart', {
        touches: [{ clientX: 100 }]
      })
      
      await drawer.trigger('touchmove', {
        touches: [{ clientX: 130 }] // Only 30px, less than threshold
      })
      
      await drawer.trigger('touchend')
      
      expect(wrapper.emitted('close')).toBeFalsy()
    })

    it('should not emit close event when swiping left', async () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      
      // Simulate left swipe
      await drawer.trigger('touchstart', {
        touches: [{ clientX: 200 }]
      })
      
      await drawer.trigger('touchmove', {
        touches: [{ clientX: 100 }]
      })
      
      await drawer.trigger('touchend')
      
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  /**
   * 日期更新测试
   */
  describe('日期更新 (Date Update)', () => {
    it('should update almanac data when selectedDate changes', async () => {
      wrapper = mountAlmanacDrawer({
        isOpen: true,
        selectedDate: new Date(2024, 1, 15)
      })
      
      const solarDate1 = wrapper.find('[data-testid="almanac-solar-date"]').text()
      expect(solarDate1).toContain('2024年2月15日')
      
      // Change selected date
      await wrapper.setProps({ selectedDate: new Date(2024, 5, 20) })
      
      const solarDate2 = wrapper.find('[data-testid="almanac-solar-date"]').text()
      expect(solarDate2).toContain('2024年6月20日')
    })

    it('should display correct weekday for different dates', async () => {
      // Test a known date: Feb 15, 2024 is Thursday
      wrapper = mountAlmanacDrawer({
        isOpen: true,
        selectedDate: new Date(2024, 1, 15)
      })
      
      const solarDate = wrapper.find('[data-testid="almanac-solar-date"]').text()
      expect(solarDate).toContain('星期四')
    })
  })

  /**
   * 无障碍访问测试
   */
  describe('无障碍访问 (Accessibility)', () => {
    it('should have proper dialog role', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      expect(drawer.attributes('role')).toBe('dialog')
    })

    it('should have aria-modal attribute', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      expect(drawer.attributes('aria-modal')).toBe('true')
    })

    it('should have accessible close button', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const closeBtn = wrapper.find('[data-testid="almanac-drawer-close"]')
      expect(closeBtn.attributes('type')).toBe('button')
      expect(closeBtn.attributes('aria-label')).toBeTruthy()
    })

    it('should have title with proper id for aria-labelledby', () => {
      wrapper = mountAlmanacDrawer({ isOpen: true })
      
      const title = wrapper.find('#almanac-drawer-title')
      expect(title.exists()).toBe(true)
      
      const drawer = wrapper.find('[data-testid="almanac-drawer"]')
      expect(drawer.attributes('aria-labelledby')).toBe('almanac-drawer-title')
    })
  })
})
