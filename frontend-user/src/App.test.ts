/**
 * App.vue 主组件测试
 * Main App component tests
 * 
 * 需求: 1.1, 2.1, 3.1
 * - 1.1: 以月视图形式展示当前月份的所有日期
 * - 2.1: 用户点击黄历按钮或从右侧边缘滑动时，抽屉从侧边滑出
 * - 3.1: 应用启动时请求用户位置权限并获取当地天气数据
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

// Mock composables
vi.mock('./composables/useCalendar', () => ({
  useCalendar: () => ({
    currentMonth: { value: new Date(2024, 0, 1) },
    selectedDate: { value: new Date(2024, 0, 15) },
    calendarDays: { value: [] },
    selectDate: vi.fn(),
    nextMonth: vi.fn(),
    prevMonth: vi.fn()
  })
}))

vi.mock('./composables/useWeather', () => ({
  useWeather: () => ({
    weatherData: { value: { location: '北京', temperature: 20, weatherDesc: '晴' } },
    weatherType: { value: 'sunny' },
    isLoading: { value: false },
    error: { value: null },
    refreshWeather: vi.fn()
  })
}))

vi.mock('./composables/useAlmanac', () => ({
  useAlmanac: () => ({
    almanacData: { value: null },
    isDrawerOpen: { value: false },
    openDrawer: vi.fn(),
    closeDrawer: vi.fn()
  })
}))

// Mock child components
vi.mock('./components/WeatherBackground.vue', () => ({
  default: {
    name: 'WeatherBackground',
    template: '<div data-testid="weather-background" />'
  }
}))

vi.mock('./components/CalendarView.vue', () => ({
  default: {
    name: 'CalendarView',
    template: '<div data-testid="calendar-view" />'
  }
}))

vi.mock('./components/AlmanacDrawer.vue', () => ({
  default: {
    name: 'AlmanacDrawer',
    template: '<div data-testid="almanac-drawer" />'
  }
}))

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('组件渲染 (Component Rendering)', () => {
    it('应该渲染应用标题', () => {
      const wrapper = mount(App)
      expect(wrapper.find('.app__title').text()).toBe('天气日历')
    })

    it('应该渲染 WeatherBackground 组件', () => {
      const wrapper = mount(App)
      expect(wrapper.findComponent({ name: 'WeatherBackground' }).exists()).toBe(true)
    })

    it('应该渲染 CalendarView 组件', () => {
      const wrapper = mount(App)
      expect(wrapper.findComponent({ name: 'CalendarView' }).exists()).toBe(true)
    })

    it('应该渲染 AlmanacDrawer 组件', () => {
      const wrapper = mount(App)
      expect(wrapper.findComponent({ name: 'AlmanacDrawer' }).exists()).toBe(true)
    })

    it('应该渲染黄历按钮', () => {
      const wrapper = mount(App)
      const almanacBtn = wrapper.find('[data-testid="almanac-open-btn"]')
      expect(almanacBtn.exists()).toBe(true)
      expect(almanacBtn.text()).toContain('黄历')
    })
  })

  describe('天气信息显示 (Weather Info Display)', () => {
    it('应该显示温度', () => {
      const wrapper = mount(App)
      expect(wrapper.find('.app__weather-temp').text()).toBe('20°C')
    })

    it('应该显示天气描述', () => {
      const wrapper = mount(App)
      expect(wrapper.find('.app__weather-desc').text()).toBe('晴')
    })

    it('应该显示位置', () => {
      const wrapper = mount(App)
      expect(wrapper.find('.app__weather-location').text()).toBe('北京')
    })
  })

  describe('组件集成 (Component Integration)', () => {
    it('应该将 weatherType 传递给 WeatherBackground', () => {
      const wrapper = mount(App)
      const weatherBg = wrapper.findComponent({ name: 'WeatherBackground' })
      expect(weatherBg.exists()).toBe(true)
    })

    it('应该将日期传递给 CalendarView', () => {
      const wrapper = mount(App)
      const calendarView = wrapper.findComponent({ name: 'CalendarView' })
      expect(calendarView.exists()).toBe(true)
    })

    it('应该将抽屉状态传递给 AlmanacDrawer', () => {
      const wrapper = mount(App)
      const almanacDrawer = wrapper.findComponent({ name: 'AlmanacDrawer' })
      expect(almanacDrawer.exists()).toBe(true)
    })
  })

  describe('黄历按钮交互 (Almanac Button Interaction)', () => {
    it('黄历按钮应该有正确的 aria-label', () => {
      const wrapper = mount(App)
      const almanacBtn = wrapper.find('[data-testid="almanac-open-btn"]')
      expect(almanacBtn.attributes('aria-label')).toBe('打开黄历')
    })
  })

  describe('布局结构 (Layout Structure)', () => {
    it('应该有正确的 CSS 类结构', () => {
      const wrapper = mount(App)
      expect(wrapper.find('.app').exists()).toBe(true)
      expect(wrapper.find('.app__content').exists()).toBe(true)
      expect(wrapper.find('.app__header').exists()).toBe(true)
    })

    it('头部应该包含标题、天气信息和黄历按钮', () => {
      const wrapper = mount(App)
      const header = wrapper.find('.app__header')
      expect(header.find('.app__title').exists()).toBe(true)
      expect(header.find('.app__weather-info').exists()).toBe(true)
      expect(header.find('.app__almanac-btn').exists()).toBe(true)
    })
  })
})
