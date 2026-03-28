<!--
  WeatherBackground.vue
  天气背景组件
  
  需求: 3.2, 3.5, 3.7
  - 3.2: 根据天气类型渲染对应的背景效果
  - 3.5: 应用半透明蒙版确保前景文本清晰可读
  - 3.7: 天气数据更新时平滑过渡到新的天气效果
-->
<script setup lang="ts">
import { computed } from 'vue'
import ParticleCanvas from './ParticleCanvas.vue'
import type { WeatherBackgroundProps, ParticleType } from '../types'

const props = defineProps<WeatherBackgroundProps>()

/**
 * 根据天气类型获取背景渐变样式
 * Get gradient background style based on weather type
 */
const backgroundGradient = computed<string>(() => {
  switch (props.weatherType) {
    case 'sunny':
      // 温暖的黄橙渐变 - warm yellow/orange gradient
      return 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 30%, #FBBF24 70%, #F59E0B 100%)'
    case 'cloudy':
      // 灰色渐变 - gray gradient
      return 'linear-gradient(180deg, #E5E7EB 0%, #D1D5DB 40%, #9CA3AF 80%, #6B7280 100%)'
    case 'rainy':
      // 深蓝灰渐变 - dark blue/gray gradient
      return 'linear-gradient(180deg, #4B5563 0%, #374151 30%, #1F2937 70%, #111827 100%)'
    case 'snowy':
      // 浅蓝白渐变 - light blue/white gradient
      return 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 30%, #BAE6FD 70%, #7DD3FC 100%)'
    case 'foggy':
      // 灰白渐变 - gray/white gradient
      return 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 30%, #E5E7EB 70%, #D1D5DB 100%)'
    default:
      // 默认禅意米色渐变 - zen cream gradient
      return 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 30%, #FDE68A 70%, #FCD34D 100%)'
  }
})

/**
 * 根据天气类型获取粒子类型
 * Get particle type based on weather type
 */
const particleType = computed<ParticleType>(() => {
  switch (props.weatherType) {
    case 'sunny':
      return 'dust'
    case 'cloudy':
      return 'cloud'
    case 'rainy':
      return 'rain'
    case 'snowy':
      return 'snow'
    case 'foggy':
      return 'fog'
    default:
      return 'dust' // 默认也显示光斑效果
  }
})

/**
 * 根据天气类型获取粒子强度
 * Get particle intensity based on weather type
 */
const particleIntensity = computed<number>(() => {
  switch (props.weatherType) {
    case 'sunny':
      return 0.5 // 适中的光斑密度
    case 'cloudy':
      return 0.6 // 较多的云朵
    case 'rainy':
      return 0.5 // 适中的雨滴密度
    case 'snowy':
      return 0.4 // 适中的雪花密度
    case 'foggy':
      return 0.7 // 较浓的雾气
    default:
      return 0.3
  }
})

/**
 * 根据天气类型获取蒙版透明度
 * Get overlay opacity based on weather type for text readability
 */
const overlayOpacity = computed<number>(() => {
  switch (props.weatherType) {
    case 'rainy':
      return 0.3 // 雨天稍高透明度
    case 'snowy':
      return 0.15
    case 'cloudy':
      return 0.2
    case 'foggy':
      return 0.1
    case 'sunny':
      return 0.15
    default:
      return 0.1
  }
})
</script>

<template>
  <div class="weather-background">
    <!-- 背景渐变层 - Background gradient layer -->
    <div
      class="weather-background__gradient"
      :style="{ background: backgroundGradient }"
      data-testid="weather-gradient"
    />
    
    <!-- 粒子动画层 - Particle animation layer -->
    <ParticleCanvas
      :particle-type="particleType"
      :intensity="particleIntensity"
      class="weather-background__particles"
      data-testid="weather-particles"
    />
    
    <!-- 半透明蒙版层 - Semi-transparent overlay for text readability -->
    <div
      class="weather-background__overlay"
      :style="{ opacity: overlayOpacity }"
      data-testid="weather-overlay"
    />
    
    <!-- 加载状态指示器 - Loading state indicator -->
    <div
      v-if="isLoading"
      class="weather-background__loading"
      data-testid="weather-loading"
    >
      <div class="weather-background__loading-spinner" />
    </div>
  </div>
</template>

<style scoped>
.weather-background {
  @apply absolute inset-0 overflow-hidden;
}

/* 背景渐变层 - 使用 CSS transition 实现平滑过渡 */
.weather-background__gradient {
  @apply absolute inset-0;
  transition: background 1.5s ease-in-out;
}

/* 粒子动画层 */
.weather-background__particles {
  @apply absolute inset-0 z-10;
}

/* 半透明蒙版层 - 确保前景文本清晰可读 */
.weather-background__overlay {
  @apply absolute inset-0 z-20;
  background: linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%);
  transition: opacity 1s ease-in-out;
}

/* 加载状态 */
.weather-background__loading {
  @apply absolute inset-0 z-30 flex items-center justify-center;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
}

.weather-background__loading-spinner {
  @apply w-12 h-12 rounded-full border-4 border-amber-200;
  border-top-color: #F59E0B;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
