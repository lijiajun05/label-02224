<!--
  ParticleCanvas.vue
  粒子动画画布组件
  
  需求: 3.3, 3.4, 6.3
  - 3.3: 天气为雨天时渲染落雨粒子动画效果
  - 3.4: 天气为雪天时渲染飘雪粒子动画效果
  - 6.3: 保持流畅的 60fps 动画性能
-->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, toRef } from 'vue'
import { useParticles } from '../composables/useParticles'
import type { ParticleCanvasProps, Particle } from '../types'

const props = defineProps<ParticleCanvasProps>()

// Canvas 引用
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

// 转换 props 为 ref 供 useParticles 使用
const particleTypeRef = toRef(props, 'particleType')
const intensityRef = toRef(props, 'intensity')

// 使用粒子组合式函数
const { particles, startAnimation, stopAnimation, setCanvasSize } = useParticles(
  particleTypeRef,
  intensityRef
) as ReturnType<typeof useParticles> & { setCanvasSize: (width: number, height: number) => void }

// 渲染帧 ID
let renderFrameId: number | null = null

/**
 * 更新画布尺寸
 * Update canvas dimensions to match container
 */
function updateCanvasSize(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const parent = canvas.parentElement
  if (!parent) return
  
  const { width, height } = parent.getBoundingClientRect()
  
  // 设置画布实际像素尺寸（考虑设备像素比以保持清晰度）
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  
  // 设置 CSS 尺寸
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  
  // 缩放上下文以匹配设备像素比
  if (ctx.value) {
    ctx.value.scale(dpr, dpr)
  }
  
  // 更新粒子系统的画布尺寸
  setCanvasSize(width, height)
}

/**
 * 渲染雨滴粒子
 * Render rain particles as thin vertical lines
 */
function renderRainParticle(context: CanvasRenderingContext2D, particle: Particle): void {
  context.beginPath()
  context.strokeStyle = `rgba(174, 194, 224, ${particle.opacity * 0.7})`
  context.lineWidth = particle.size * 0.5
  context.lineCap = 'round'
  
  // 雨滴渲染为细长的垂直线
  const length = particle.size * 8
  context.moveTo(particle.x, particle.y)
  context.lineTo(particle.x + particle.vx * 0.8, particle.y + length)
  context.stroke()
}

/**
 * 渲染雪花粒子
 * Render snow particles as soft circles with rotation
 */
function renderSnowParticle(context: CanvasRenderingContext2D, particle: Particle): void {
  context.save()
  context.translate(particle.x, particle.y)
  if (particle.rotation !== undefined) {
    context.rotate(particle.rotation)
  }
  
  // 绘制六角雪花
  context.beginPath()
  context.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
  
  const size = particle.size
  // 中心圆
  context.arc(0, 0, size * 0.3, 0, Math.PI * 2)
  context.fill()
  
  // 六条分支
  context.strokeStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`
  context.lineWidth = size * 0.15
  context.lineCap = 'round'
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(Math.cos(angle) * size, Math.sin(angle) * size)
    context.stroke()
  }
  
  context.restore()
}

/**
 * 渲染光斑粒子（晴天）
 * Render dust/light particles for sunny weather
 */
function renderDustParticle(context: CanvasRenderingContext2D, particle: Particle): void {
  const size = particle.size * 1.5 // 放大渲染尺寸
  
  // 外层光晕
  const outerGradient = context.createRadialGradient(
    particle.x, particle.y, 0,
    particle.x, particle.y, size * 1.5
  )
  outerGradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity * 0.8})`)
  outerGradient.addColorStop(0.3, `rgba(255, 250, 220, ${particle.opacity * 0.5})`)
  outerGradient.addColorStop(0.6, `rgba(255, 215, 0, ${particle.opacity * 0.2})`)
  outerGradient.addColorStop(1, 'rgba(255, 200, 0, 0)')
  
  context.beginPath()
  context.fillStyle = outerGradient
  context.arc(particle.x, particle.y, size * 1.5, 0, Math.PI * 2)
  context.fill()
  
  // 内层亮点
  const innerGradient = context.createRadialGradient(
    particle.x, particle.y, 0,
    particle.x, particle.y, size * 0.5
  )
  innerGradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity})`)
  innerGradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
  
  context.beginPath()
  context.fillStyle = innerGradient
  context.arc(particle.x, particle.y, size * 0.5, 0, Math.PI * 2)
  context.fill()
}

/**
 * 渲染云朵粒子
 * Render cloud particles for cloudy weather
 */
function renderCloudParticle(context: CanvasRenderingContext2D, particle: Particle): void {
  context.save()
  context.globalAlpha = particle.opacity
  
  const size = particle.size
  const x = particle.x
  const y = particle.y
  
  // 绘制云朵形状（多个重叠的圆）
  context.fillStyle = 'rgba(255, 255, 255, 0.8)'
  
  context.beginPath()
  context.arc(x, y, size * 0.5, 0, Math.PI * 2)
  context.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2)
  context.arc(x + size * 0.8, y, size * 0.35, 0, Math.PI * 2)
  context.arc(x + size * 0.3, y + size * 0.2, size * 0.3, 0, Math.PI * 2)
  context.arc(x + size * 0.6, y + size * 0.15, size * 0.25, 0, Math.PI * 2)
  context.fill()
  
  context.restore()
}

/**
 * 渲染雾气粒子
 * Render fog particles for foggy weather
 */
function renderFogParticle(context: CanvasRenderingContext2D, particle: Particle): void {
  const gradient = context.createRadialGradient(
    particle.x, particle.y, 0,
    particle.x, particle.y, particle.size
  )
  
  gradient.addColorStop(0, `rgba(220, 220, 220, ${particle.opacity})`)
  gradient.addColorStop(0.5, `rgba(200, 200, 200, ${particle.opacity * 0.5})`)
  gradient.addColorStop(1, 'rgba(180, 180, 180, 0)')
  
  context.beginPath()
  context.fillStyle = gradient
  context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  context.fill()
}

/**
 * 渲染所有粒子
 * Render all particles on canvas
 */
function render(): void {
  const canvas = canvasRef.value
  const context = ctx.value
  if (!canvas || !context) return
  
  // 获取 CSS 尺寸（非像素尺寸）
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  
  // 清除画布
  context.clearRect(0, 0, width, height)
  
  // 如果没有粒子，不渲染
  if (props.particleType === 'none' || particles.value.length === 0) {
    return
  }
  
  // 根据粒子类型选择渲染方法
  let renderParticle: (ctx: CanvasRenderingContext2D, p: Particle) => void
  
  switch (props.particleType) {
    case 'rain':
      renderParticle = renderRainParticle
      break
    case 'snow':
      renderParticle = renderSnowParticle
      break
    case 'dust':
      renderParticle = renderDustParticle
      break
    case 'cloud':
      renderParticle = renderCloudParticle
      break
    case 'fog':
      renderParticle = renderFogParticle
      break
    default:
      return
  }
  
  // 渲染所有粒子
  for (const particle of particles.value) {
    renderParticle(context, particle)
  }
}

/**
 * 渲染循环
 * Render loop using requestAnimationFrame for 60fps
 */
function renderLoop(): void {
  render()
  renderFrameId = requestAnimationFrame(renderLoop)
}

/**
 * 开始渲染
 * Start the render loop
 */
function startRender(): void {
  if (renderFrameId !== null) return
  renderFrameId = requestAnimationFrame(renderLoop)
}

/**
 * 停止渲染
 * Stop the render loop
 */
function stopRender(): void {
  if (renderFrameId !== null) {
    cancelAnimationFrame(renderFrameId)
    renderFrameId = null
  }
}

/**
 * 初始化画布
 * Initialize canvas context
 */
function initCanvas(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  
  ctx.value = canvas.getContext('2d')
  updateCanvasSize()
}

// 监听粒子类型变化，重新启动动画
watch(
  () => props.particleType,
  (newType) => {
    stopAnimation()
    if (newType !== 'none') {
      startAnimation()
    }
  }
)

// 监听强度变化，重新初始化粒子
watch(
  () => props.intensity,
  () => {
    if (props.particleType !== 'none') {
      stopAnimation()
      startAnimation()
    }
  }
)

// 窗口大小变化处理
function handleResize(): void {
  const canvas = canvasRef.value
  if (!canvas || !ctx.value) return
  
  // 重置上下文缩放
  ctx.value.setTransform(1, 0, 0, 1, 0, 0)
  updateCanvasSize()
}

// 组件挂载
onMounted(() => {
  initCanvas()
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
  
  // 如果有粒子类型，启动动画
  if (props.particleType !== 'none') {
    startAnimation()
  }
  
  // 启动渲染循环
  startRender()
})

// 组件卸载
onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
  
  // 停止动画和渲染
  stopAnimation()
  stopRender()
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 w-full h-full pointer-events-none"
    aria-hidden="true"
  />
</template>
