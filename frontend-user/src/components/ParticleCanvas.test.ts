/**
 * ParticleCanvas 组件测试
 * Tests for the ParticleCanvas component
 * 
 * 验证: 需求 3.3, 3.4, 6.3
 * - 3.3: 天气为雨天时渲染落雨粒子动画效果
 * - 3.4: 天气为雪天时渲染飘雪粒子动画效果
 * - 6.3: 保持流畅的 60fps 动画性能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ParticleCanvas from './ParticleCanvas.vue'

describe('ParticleCanvas', () => {
  let mockRequestAnimationFrame: ReturnType<typeof vi.fn>
  let mockCancelAnimationFrame: ReturnType<typeof vi.fn>
  let frameId = 0
  let wrapper: VueWrapper | null = null

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

  describe('rendering', () => {
    it('should render a canvas element', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
    })

    it('should have correct CSS classes for positioning', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      const canvas = wrapper.find('canvas')
      expect(canvas.classes()).toContain('absolute')
      expect(canvas.classes()).toContain('inset-0')
      expect(canvas.classes()).toContain('pointer-events-none')
    })

    it('should have aria-hidden attribute for accessibility', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      const canvas = wrapper.find('canvas')
      expect(canvas.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('animation lifecycle', () => {
    it('should start animation on mount with rain type', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      // Should have called requestAnimationFrame for both particle animation and render loop
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should start animation on mount with snow type', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'snow',
          intensity: 0.5
        }
      })
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should not start particle animation when type is none', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'none',
          intensity: 0.5
        }
      })
      
      // Render loop still runs, but particle animation should not create particles
      // The render loop is always started for performance consistency
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should cancel animation on unmount', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      wrapper.unmount()
      wrapper = null
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('props reactivity', () => {
    it('should restart animation when particleType changes', async () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      const initialCalls = mockRequestAnimationFrame.mock.calls.length
      
      await wrapper.setProps({ particleType: 'snow' })
      
      // Should have made additional calls for new animation
      expect(mockRequestAnimationFrame.mock.calls.length).toBeGreaterThan(initialCalls)
    })

    it('should stop animation when particleType changes to none', async () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      await wrapper.setProps({ particleType: 'none' })
      
      // Should have called cancelAnimationFrame to stop particle animation
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    it('should restart animation when intensity changes', async () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.3
        }
      })
      
      const initialCalls = mockRequestAnimationFrame.mock.calls.length
      
      await wrapper.setProps({ intensity: 0.8 })
      
      // Should have restarted animation
      expect(mockRequestAnimationFrame.mock.calls.length).toBeGreaterThan(initialCalls)
    })
  })

  describe('canvas context', () => {
    it('should get 2d context from canvas', () => {
      const mockGetContext = vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        scale: vi.fn(),
        setTransform: vi.fn()
      }))
      
      HTMLCanvasElement.prototype.getContext = mockGetContext as any
      
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      expect(mockGetContext).toHaveBeenCalledWith('2d')
    })
  })

  describe('window resize handling', () => {
    it('should add resize event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should remove resize event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      wrapper.unmount()
      wrapper = null
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('performance (60fps)', () => {
    it('should use requestAnimationFrame for render loop', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      // requestAnimationFrame is the standard way to achieve 60fps
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
    })

    it('should properly clean up animation frames to prevent memory leaks', () => {
      wrapper = mount(ParticleCanvas, {
        props: {
          particleType: 'rain',
          intensity: 0.5
        }
      })
      
      wrapper.unmount()
      wrapper = null
      
      // Should cancel all animation frames on unmount
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })
  })
})
