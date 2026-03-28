/**
 * useParticles 组合式函数
 * Particles composable for managing weather particle animations
 * 
 * 需求: 3.3, 3.4
 * - 3.3: 天气为雨天时渲染落雨粒子动画效果
 * - 3.4: 天气为雪天时渲染飘雪粒子动画效果
 */

import { ref, onUnmounted, getCurrentInstance } from 'vue'
import type { Ref } from 'vue'
import type { Particle, ParticleType, UseParticlesReturn } from '../types'

/**
 * 粒子配置
 * Configuration for different particle types
 */
interface ParticleConfig {
  /** 基础下落速度 */
  baseVelocityY: number
  /** 速度变化范围 */
  velocityYRange: number
  /** 水平速度范围 */
  velocityXRange: number
  /** 基础大小 */
  baseSize: number
  /** 大小变化范围 */
  sizeRange: number
  /** 基础透明度 */
  baseOpacity: number
  /** 透明度变化范围 */
  opacityRange: number
}

const RAIN_CONFIG: ParticleConfig = {
  baseVelocityY: 10,     // 雨滴下落较快
  velocityYRange: 5,
  velocityXRange: 2,     // 雨滴有轻微倾斜
  baseSize: 2,           // 雨滴较小
  sizeRange: 1.5,
  baseOpacity: 0.5,
  opacityRange: 0.3
}

const SNOW_CONFIG: ParticleConfig = {
  baseVelocityY: 1.2,    // 雪花下落较慢
  velocityYRange: 0.8,
  velocityXRange: 1.5,   // 雪花有水平飘动
  baseSize: 5,           // 雪花较大
  sizeRange: 4,
  baseOpacity: 0.8,
  opacityRange: 0.2
}

const DUST_CONFIG: ParticleConfig = {
  baseVelocityY: 0.5,    // 光斑缓慢上升
  velocityYRange: 0.3,
  velocityXRange: 0.8,   // 轻微水平漂移
  baseSize: 6,           // 光斑更大更明显
  sizeRange: 8,
  baseOpacity: 0.5,      // 提高基础透明度
  opacityRange: 0.4
}

const CLOUD_CONFIG: ParticleConfig = {
  baseVelocityY: 0,      // 云朵不垂直移动
  velocityYRange: 0.1,
  velocityXRange: 0.8,   // 云朵水平飘动
  baseSize: 40,          // 云朵较大
  sizeRange: 30,
  baseOpacity: 0.15,
  opacityRange: 0.1
}

const FOG_CONFIG: ParticleConfig = {
  baseVelocityY: 0.1,    // 雾气缓慢移动
  velocityYRange: 0.2,
  velocityXRange: 0.6,   // 雾气水平飘动
  baseSize: 80,          // 雾气团较大
  sizeRange: 60,
  baseOpacity: 0.08,
  opacityRange: 0.06
}

/**
 * 根据强度计算粒子数量
 * Calculate particle count based on intensity and type
 * 
 * @param intensity - 强度值 (0-1)
 * @param type - 粒子类型
 * @returns 粒子数量
 */
function getParticleCount(intensity: number, type: ParticleType): number {
  const clampedIntensity = Math.max(0, Math.min(1, intensity))
  
  switch (type) {
    case 'rain':
      return Math.floor(30 + 120 * clampedIntensity)
    case 'snow':
      return Math.floor(25 + 80 * clampedIntensity)
    case 'dust':
      return Math.floor(25 + 60 * clampedIntensity) // 增加光斑数量
    case 'cloud':
      return Math.floor(5 + 10 * clampedIntensity)
    case 'fog':
      return Math.floor(8 + 15 * clampedIntensity)
    default:
      return 0
  }
}

/**
 * 创建单个粒子
 * Create a single particle with random properties
 * 
 * @param config - 粒子配置
 * @param type - 粒子类型
 * @param canvasWidth - 画布宽度
 * @param canvasHeight - 画布高度
 * @param startFromTop - 是否从顶部开始（初始化时为 false，重置时为 true）
 * @returns 新粒子
 */
function createParticle(
  config: ParticleConfig,
  type: ParticleType,
  canvasWidth: number,
  canvasHeight: number,
  startFromTop: boolean = false
): Particle {
  const baseParticle: Particle = {
    x: Math.random() * canvasWidth,
    y: startFromTop ? -config.baseSize - config.sizeRange : Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * config.velocityXRange * 2,
    vy: config.baseVelocityY + Math.random() * config.velocityYRange,
    size: config.baseSize + Math.random() * config.sizeRange,
    opacity: config.baseOpacity + Math.random() * config.opacityRange
  }

  // 根据粒子类型添加特殊属性
  switch (type) {
    case 'snow':
      baseParticle.rotation = Math.random() * Math.PI * 2
      baseParticle.rotationSpeed = (Math.random() - 0.5) * 0.02
      break
    case 'dust':
      baseParticle.twinklePhase = Math.random() * Math.PI * 2
      baseParticle.twinkleSpeed = 0.02 + Math.random() * 0.03
      baseParticle.vy = -Math.abs(baseParticle.vy) // 光斑向上飘
      baseParticle.color = Math.random() > 0.5 ? '#FCD34D' : '#FBBF24'
      break
    case 'cloud':
      baseParticle.y = Math.random() * canvasHeight * 0.6 // 云朵在上半部分
      baseParticle.vx = 0.2 + Math.random() * 0.6 // 云朵向右飘
      baseParticle.rotation = 0
      break
    case 'fog':
      baseParticle.twinklePhase = Math.random() * Math.PI * 2
      baseParticle.twinkleSpeed = 0.005 + Math.random() * 0.01
      break
  }

  return baseParticle
}

/**
 * 粒子组合式函数
 * Composable for particle animation management
 * 
 * @param particleType - 粒子类型 ('rain' | 'snow' | 'none')
 * @param intensity - 粒子强度 (0-1)
 * @returns UseParticlesReturn - 粒子状态和控制方法
 */
export function useParticles(
  particleType: Ref<ParticleType>,
  intensity: Ref<number>
): UseParticlesReturn {
  // 粒子数组
  const particles: Ref<Particle[]> = ref([])
  
  // 动画帧 ID
  let animationFrameId: number | null = null
  
  // 画布尺寸（默认值，实际使用时应由组件设置）
  let canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  let canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 768
  
  /**
   * 获取当前粒子类型的配置
   */
  function getConfig(): ParticleConfig | null {
    switch (particleType.value) {
      case 'rain':
        return RAIN_CONFIG
      case 'snow':
        return SNOW_CONFIG
      case 'dust':
        return DUST_CONFIG
      case 'cloud':
        return CLOUD_CONFIG
      case 'fog':
        return FOG_CONFIG
      default:
        return null
    }
  }
  
  /**
   * 初始化粒子数组
   * Initialize particles array based on type and intensity
   */
  function initializeParticles(): void {
    const config = getConfig()
    if (!config) {
      particles.value = []
      return
    }
    
    const count = getParticleCount(intensity.value, particleType.value)
    const newParticles: Particle[] = []
    
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(config, particleType.value, canvasWidth, canvasHeight, false))
    }
    
    particles.value = newParticles
  }
  
  /**
   * 更新粒子位置
   * Update particle positions for animation frame
   */
  function updateParticles(): void {
    const config = getConfig()
    if (!config || particles.value.length === 0) {
      return
    }
    
    const type = particleType.value
    
    particles.value = particles.value.map(particle => {
      // 更新位置
      let newX = particle.x + particle.vx
      let newY = particle.y + particle.vy
      let newRotation = particle.rotation
      let newTwinklePhase = particle.twinklePhase
      let newOpacity = particle.opacity
      
      // 根据粒子类型应用特殊行为
      switch (type) {
        case 'snow':
          // 雪花添加轻微的水平摆动和旋转
          newX += Math.sin(newY * 0.01) * 0.5
          if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
            newRotation = particle.rotation + particle.rotationSpeed
          }
          break
        case 'dust':
          // 光斑闪烁效果
          if (particle.twinklePhase !== undefined && particle.twinkleSpeed !== undefined) {
            newTwinklePhase = particle.twinklePhase + particle.twinkleSpeed
            newOpacity = (config.baseOpacity + config.opacityRange * 0.5) * 
              (0.5 + 0.5 * Math.sin(newTwinklePhase))
          }
          // 光斑轻微水平摆动
          newX += Math.sin(newY * 0.02) * 0.3
          break
        case 'cloud':
          // 云朵缓慢上下浮动
          newY += Math.sin(particle.x * 0.005 + Date.now() * 0.0003) * 0.2
          break
        case 'fog':
          // 雾气透明度波动
          if (particle.twinklePhase !== undefined && particle.twinkleSpeed !== undefined) {
            newTwinklePhase = particle.twinklePhase + particle.twinkleSpeed
            newOpacity = config.baseOpacity * (0.6 + 0.4 * Math.sin(newTwinklePhase))
          }
          break
      }
      
      // 检查是否超出边界，需要重置
      const needsReset = 
        (type === 'dust' && newY < -particle.size) || // 光斑向上飘出
        (type !== 'dust' && newY > canvasHeight + particle.size) // 其他向下落出
      
      if (needsReset) {
        return createParticle(config, type, canvasWidth, canvasHeight, true)
      }
      
      // 水平边界处理（循环）
      if (newX < -particle.size) {
        newX = canvasWidth + particle.size
      } else if (newX > canvasWidth + particle.size) {
        newX = -particle.size
      }
      
      return {
        ...particle,
        x: newX,
        y: newY,
        rotation: newRotation,
        twinklePhase: newTwinklePhase,
        opacity: newOpacity
      }
    })
  }
  
  /**
   * 动画循环
   * Animation loop using requestAnimationFrame
   */
  function animationLoop(): void {
    updateParticles()
    animationFrameId = requestAnimationFrame(animationLoop)
  }
  
  /**
   * 开始动画
   * Start the particle animation
   */
  function startAnimation(): void {
    // 如果已经在运行，先停止
    if (animationFrameId !== null) {
      stopAnimation()
    }
    
    // 如果粒子类型为 none，不启动动画
    if (particleType.value === 'none') {
      particles.value = []
      return
    }
    
    // 初始化粒子
    initializeParticles()
    
    // 开始动画循环
    animationFrameId = requestAnimationFrame(animationLoop)
  }
  
  /**
   * 停止动画
   * Stop the particle animation
   */
  function stopAnimation(): void {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
  
  /**
   * 设置画布尺寸
   * Set canvas dimensions for particle bounds
   * 
   * @param width - 画布宽度
   * @param height - 画布高度
   */
  function setCanvasSize(width: number, height: number): void {
    canvasWidth = width
    canvasHeight = height
  }
  
  // 组件卸载时清理动画（仅在组件上下文中注册）
  if (getCurrentInstance()) {
    onUnmounted(() => {
      stopAnimation()
    })
  }
  
  return {
    particles,
    startAnimation,
    stopAnimation,
    // 导出 setCanvasSize 供组件使用（扩展接口）
    setCanvasSize
  } as UseParticlesReturn & { setCanvasSize: (width: number, height: number) => void }
}
