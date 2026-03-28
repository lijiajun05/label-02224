/**
 * useParticles 组合式函数测试
 * Tests for the useParticles composable
 * 
 * 验证: 需求 3.3, 3.4
 * - 3.3: 天气为雨天时渲染落雨粒子动画效果
 * - 3.4: 天气为雪天时渲染飘雪粒子动画效果
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { useParticles } from './useParticles'
import type { ParticleType } from '../types'

describe('useParticles', () => {
  let mockRequestAnimationFrame: ReturnType<typeof vi.fn>
  let mockCancelAnimationFrame: ReturnType<typeof vi.fn>
  let frameId = 0

  beforeEach(() => {
    frameId = 0
    mockRequestAnimationFrame = vi.fn(() => ++frameId)
    mockCancelAnimationFrame = vi.fn()
    
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('initialization', () => {
    it('should initialize with empty particles array', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { particles } = useParticles(particleType, intensity)
      
      expect(particles.value).toEqual([])
    })

    it('should return startAnimation and stopAnimation functions', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const result = useParticles(particleType, intensity)
      
      expect(typeof result.startAnimation).toBe('function')
      expect(typeof result.stopAnimation).toBe('function')
    })
  })

  describe('startAnimation', () => {
    it('should create particles when started with rain type', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { particles, startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      
      expect(particles.value.length).toBeGreaterThan(0)
      
      stopAnimation()
    })

    it('should create particles when started with snow type', () => {
      const particleType = ref<ParticleType>('snow')
      const intensity = ref(0.5)
      
      const { particles, startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      
      expect(particles.value.length).toBeGreaterThan(0)
      
      stopAnimation()
    })

    it('should not create particles when type is none', () => {
      const particleType = ref<ParticleType>('none')
      const intensity = ref(0.5)
      
      const { particles, startAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      
      expect(particles.value).toEqual([])
    })

    it('should start requestAnimationFrame loop', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      
      expect(mockRequestAnimationFrame).toHaveBeenCalled()
      
      stopAnimation()
    })

    it('should create more particles with higher intensity', () => {
      const particleType = ref<ParticleType>('rain')
      const lowIntensity = ref(0.1)
      const highIntensity = ref(0.9)
      
      const lowResult = useParticles(particleType, lowIntensity)
      const highResult = useParticles(particleType, highIntensity)
      
      lowResult.startAnimation()
      highResult.startAnimation()
      
      expect(highResult.particles.value.length).toBeGreaterThan(lowResult.particles.value.length)
      
      lowResult.stopAnimation()
      highResult.stopAnimation()
    })
  })

  describe('stopAnimation', () => {
    it('should cancel animation frame when stopped', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      stopAnimation()
      
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
    })

    it('should not throw when called without starting', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { stopAnimation } = useParticles(particleType, intensity)
      
      expect(() => stopAnimation()).not.toThrow()
    })
  })

  describe('particle properties', () => {
    it('should create particles with valid properties', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { particles, startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      
      particles.value.forEach(particle => {
        expect(particle.x).toBeGreaterThanOrEqual(0)
        expect(particle.y).toBeDefined()
        expect(particle.vx).toBeDefined()
        expect(particle.vy).toBeGreaterThan(0)
        expect(particle.size).toBeGreaterThan(0)
        expect(particle.opacity).toBeGreaterThan(0)
        expect(particle.opacity).toBeLessThanOrEqual(1)
      })
      
      stopAnimation()
    })

    it('should create rain particles with faster vertical velocity', () => {
      const rainType = ref<ParticleType>('rain')
      const snowType = ref<ParticleType>('snow')
      const intensity = ref(0.5)
      
      const rainResult = useParticles(rainType, intensity)
      const snowResult = useParticles(snowType, intensity)
      
      rainResult.startAnimation()
      snowResult.startAnimation()
      
      // Calculate average vertical velocity
      const avgRainVy = rainResult.particles.value.reduce((sum, p) => sum + p.vy, 0) / rainResult.particles.value.length
      const avgSnowVy = snowResult.particles.value.reduce((sum, p) => sum + p.vy, 0) / snowResult.particles.value.length
      
      // Rain should fall faster than snow
      expect(avgRainVy).toBeGreaterThan(avgSnowVy)
      
      rainResult.stopAnimation()
      snowResult.stopAnimation()
    })

    it('should create snow particles with larger size', () => {
      const rainType = ref<ParticleType>('rain')
      const snowType = ref<ParticleType>('snow')
      const intensity = ref(0.5)
      
      const rainResult = useParticles(rainType, intensity)
      const snowResult = useParticles(snowType, intensity)
      
      rainResult.startAnimation()
      snowResult.startAnimation()
      
      // Calculate average size
      const avgRainSize = rainResult.particles.value.reduce((sum, p) => sum + p.size, 0) / rainResult.particles.value.length
      const avgSnowSize = snowResult.particles.value.reduce((sum, p) => sum + p.size, 0) / snowResult.particles.value.length
      
      // Snow should be larger than rain
      expect(avgSnowSize).toBeGreaterThan(avgRainSize)
      
      rainResult.stopAnimation()
      snowResult.stopAnimation()
    })
  })

  describe('restart behavior', () => {
    it('should stop previous animation when starting new one', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      startAnimation() // Start again
      
      // Should have cancelled the previous animation
      expect(mockCancelAnimationFrame).toHaveBeenCalled()
      
      stopAnimation()
    })

    it('should reinitialize particles when restarted', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const { particles, startAnimation, stopAnimation } = useParticles(particleType, intensity)
      
      startAnimation()
      const firstCount = particles.value.length
      
      startAnimation()
      const secondCount = particles.value.length
      
      // Should have similar particle counts
      expect(secondCount).toBeGreaterThan(0)
      expect(Math.abs(firstCount - secondCount)).toBeLessThan(5)
      
      stopAnimation()
    })
  })

  describe('setCanvasSize', () => {
    it('should expose setCanvasSize function', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const result = useParticles(particleType, intensity) as ReturnType<typeof useParticles> & { setCanvasSize: (w: number, h: number) => void }
      
      expect(typeof result.setCanvasSize).toBe('function')
    })

    it('should not throw when setting canvas size', () => {
      const particleType = ref<ParticleType>('rain')
      const intensity = ref(0.5)
      
      const result = useParticles(particleType, intensity) as ReturnType<typeof useParticles> & { setCanvasSize: (w: number, h: number) => void }
      
      expect(() => result.setCanvasSize(800, 600)).not.toThrow()
    })
  })
})
