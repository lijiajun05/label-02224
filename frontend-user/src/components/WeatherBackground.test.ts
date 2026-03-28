/**
 * WeatherBackground.vue 组件测试
 * Tests for WeatherBackground component
 * 
 * 需求: 3.2, 3.5, 3.7
 * - 3.2: 根据天气类型渲染对应的背景效果
 * - 3.5: 应用半透明蒙版确保前景文本清晰可读
 * - 3.7: 天气数据更新时平滑过渡到新的天气效果
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import WeatherBackground from './WeatherBackground.vue'
import type { WeatherType } from '../types'

// Helper function to mount component with proper typing
function mountWeatherBackground(props: { weatherType: WeatherType; isLoading: boolean }) {
  return mount(WeatherBackground, {
    props: props as any
  })
}

describe('WeatherBackground', () => {
  let wrapper: VueWrapper | null = null
  let mockRequestAnimationFrame: ReturnType<typeof vi.fn>
  let mockCancelAnimationFrame: ReturnType<typeof vi.fn>
  let frameId = 0

  beforeEach(() => {
    frameId = 0
    mockRequestAnimationFrame = vi.fn(() => ++frameId)
    mockCancelAnimationFrame = vi.fn()
    
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame)
    
    // Mock getBoundingClientRect for canvas parent
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {}
    }))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  /**
   * 需求 3.2: 根据天气类型渲染对应的背景效果
   */
  describe('背景渐变渲染 (Background Gradient Rendering)', () => {
    it('should render sunny gradient for sunny weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      expect(gradient.exists()).toBe(true)
      
      const style = gradient.attributes('style')
      expect(style).toContain('linear-gradient')
      // 验证包含温暖的黄橙色
      expect(style).toContain('#FEF3C7')
      expect(style).toContain('#F59E0B')
    })

    it('should render cloudy gradient for cloudy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'cloudy',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      const style = gradient.attributes('style')
      // 验证包含灰色
      expect(style).toContain('#E5E7EB')
      expect(style).toContain('#6B7280')
    })

    it('should render rainy gradient for rainy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'rainy',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      const style = gradient.attributes('style')
      // 验证包含深蓝灰色
      expect(style).toContain('#4B5563')
      expect(style).toContain('#111827')
    })

    it('should render snowy gradient for snowy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'snowy',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      const style = gradient.attributes('style')
      // 验证包含浅蓝白色
      expect(style).toContain('#F0F9FF')
      expect(style).toContain('#7DD3FC')
    })

    it('should render foggy gradient for foggy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'foggy',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      const style = gradient.attributes('style')
      // 验证包含灰白色
      expect(style).toContain('#F9FAFB')
      expect(style).toContain('#D1D5DB')
    })

    it('should render default zen gradient for default weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'default',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      const style = gradient.attributes('style')
      // 验证包含禅意米色
      expect(style).toContain('#FFFBEB')
      expect(style).toContain('#FCD34D')
    })
  })

  /**
   * 粒子动画集成测试
   * 现在所有天气类型都有粒子效果
   */
  describe('粒子动画集成 (Particle Canvas Integration)', () => {
    it('should render ParticleCanvas for rainy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'rainy',
        isLoading: false
      })
      
      const particles = wrapper.find('[data-testid="weather-particles"]')
      expect(particles.exists()).toBe(true)
    })

    it('should render ParticleCanvas for snowy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'snowy',
        isLoading: false
      })
      
      const particles = wrapper.find('[data-testid="weather-particles"]')
      expect(particles.exists()).toBe(true)
    })

    it('should render ParticleCanvas for sunny weather (dust particles)', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      const particles = wrapper.find('[data-testid="weather-particles"]')
      expect(particles.exists()).toBe(true)
    })

    it('should render ParticleCanvas for cloudy weather (cloud particles)', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'cloudy',
        isLoading: false
      })
      
      const particles = wrapper.find('[data-testid="weather-particles"]')
      expect(particles.exists()).toBe(true)
    })

    it('should render ParticleCanvas for default weather (dust particles)', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'default',
        isLoading: false
      })
      
      const particles = wrapper.find('[data-testid="weather-particles"]')
      expect(particles.exists()).toBe(true)
    })
  })

  /**
   * 需求 3.5: 应用半透明蒙版确保前景文本清晰可读
   */
  describe('半透明蒙版层 (Semi-transparent Overlay)', () => {
    it('should render overlay for all weather types', () => {
      const weatherTypes: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'default']
      
      weatherTypes.forEach(weatherType => {
        const testWrapper = mountWeatherBackground({
          weatherType,
          isLoading: false
        })
        
        const overlay = testWrapper.find('[data-testid="weather-overlay"]')
        expect(overlay.exists()).toBe(true)
        testWrapper.unmount()
      })
    })

    it('should have higher opacity for rainy weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'rainy',
        isLoading: false
      })
      
      const overlay = wrapper.find('[data-testid="weather-overlay"]')
      const style = overlay.attributes('style')
      expect(style).toContain('opacity: 0.3')
    })

    it('should have lower opacity for sunny weather', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      const overlay = wrapper.find('[data-testid="weather-overlay"]')
      const style = overlay.attributes('style')
      expect(style).toContain('opacity: 0.15')
    })
  })

  /**
   * 需求 3.7: 天气数据更新时平滑过渡
   */
  describe('天气切换过渡动画 (Weather Transition Animation)', () => {
    it('should have transition style on gradient element', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      const gradient = wrapper.find('[data-testid="weather-gradient"]')
      // 检查元素是否有 transition 类
      expect(gradient.classes()).toContain('weather-background__gradient')
    })

    it('should have transition style on overlay element', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      const overlay = wrapper.find('[data-testid="weather-overlay"]')
      expect(overlay.classes()).toContain('weather-background__overlay')
    })

    it('should update gradient when weather type changes', async () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      let gradient = wrapper.find('[data-testid="weather-gradient"]')
      let style = gradient.attributes('style')
      expect(style).toContain('#FEF3C7') // sunny color
      
      // 更新天气类型
      await wrapper.setProps({ weatherType: 'rainy' })
      
      gradient = wrapper.find('[data-testid="weather-gradient"]')
      style = gradient.attributes('style')
      expect(style).toContain('#4B5563') // rainy color
    })
  })

  /**
   * 加载状态测试
   */
  describe('加载状态 (Loading State)', () => {
    it('should show loading indicator when isLoading is true', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'default',
        isLoading: true
      })
      
      const loading = wrapper.find('[data-testid="weather-loading"]')
      expect(loading.exists()).toBe(true)
    })

    it('should hide loading indicator when isLoading is false', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'sunny',
        isLoading: false
      })
      
      const loading = wrapper.find('[data-testid="weather-loading"]')
      expect(loading.exists()).toBe(false)
    })

    it('should show loading spinner inside loading indicator', () => {
      wrapper = mountWeatherBackground({
        weatherType: 'default',
        isLoading: true
      })
      
      const spinner = wrapper.find('.weather-background__loading-spinner')
      expect(spinner.exists()).toBe(true)
    })
  })
})
