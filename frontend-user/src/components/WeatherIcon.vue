<!--
  WeatherIcon.vue
  天气图标组件 - 使用 SVG 渲染真实天气效果
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { WeatherType } from '../types'

withDefaults(defineProps<{
  type: WeatherType
  size?: number
}>(), {
  size: 24
})

const viewBox = computed(() => '0 0 64 64')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="weather-icon"
    aria-hidden="true"
  >
    <!-- 晴天 - 太阳 -->
    <template v-if="type === 'sunny'">
      <!-- 太阳光芒 -->
      <g class="sun-rays">
        <line x1="32" y1="4" x2="32" y2="12" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="32" y1="52" x2="32" y2="60" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="4" y1="32" x2="12" y2="32" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="52" y1="32" x2="60" y2="32" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="12.2" y1="12.2" x2="17.9" y2="17.9" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="46.1" y1="46.1" x2="51.8" y2="51.8" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="12.2" y1="51.8" x2="17.9" y2="46.1" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <line x1="46.1" y1="17.9" x2="51.8" y2="12.2" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
      </g>
      <!-- 太阳本体 -->
      <circle cx="32" cy="32" r="14" fill="url(#sunGradient)"/>
      <defs>
        <radialGradient id="sunGradient" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#FDE68A"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </radialGradient>
      </defs>
    </template>

    <!-- 多云 -->
    <template v-else-if="type === 'cloudy'">
      <!-- 背景小太阳 -->
      <circle cx="44" cy="20" r="10" fill="#FCD34D" opacity="0.8"/>
      <!-- 主云朵 -->
      <path
        d="M48 44c4.4 0 8-3.6 8-8 0-4-2.9-7.3-6.7-7.9C48.5 22.5 43.7 18 38 18c-6.1 0-11.1 4.5-11.9 10.4C22.5 29.1 20 32.3 20 36c0 4.4 3.6 8 8 8h20z"
        fill="url(#cloudGradient)"
      />
      <defs>
        <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F9FAFB"/>
          <stop offset="100%" stop-color="#D1D5DB"/>
        </linearGradient>
      </defs>
    </template>

    <!-- 雨天 -->
    <template v-else-if="type === 'rainy'">
      <!-- 云朵 -->
      <path
        d="M46 32c3.3 0 6-2.7 6-6 0-3-2.2-5.5-5-5.9C46.4 15.9 42.8 13 38.5 13c-4.6 0-8.3 3.4-8.9 7.8C26.9 21.3 25 23.7 25 26.5c0 3.3 2.7 5.5 6 5.5h15z"
        fill="#9CA3AF"
      />
      <!-- 雨滴 -->
      <g class="rain-drops">
        <path d="M28 38l-3 10" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M36 36l-3 12" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M44 38l-3 10" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M32 42l-2 8" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
        <path d="M40 44l-2 6" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      </g>
    </template>

    <!-- 雪天 -->
    <template v-else-if="type === 'snowy'">
      <!-- 云朵 -->
      <path
        d="M46 28c3.3 0 6-2.7 6-6 0-3-2.2-5.5-5-5.9C46.4 11.9 42.8 9 38.5 9c-4.6 0-8.3 3.4-8.9 7.8C26.9 17.3 25 19.7 25 22.5c0 3.3 2.7 5.5 6 5.5h15z"
        fill="#E5E7EB"
      />
      <!-- 雪花 -->
      <g class="snowflakes">
        <g transform="translate(28, 40)">
          <circle r="2" fill="#BFDBFE"/>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#BFDBFE" stroke-width="1.5"/>
          <line x1="-4.3" y1="-2.5" x2="4.3" y2="2.5" stroke="#BFDBFE" stroke-width="1.5"/>
          <line x1="-4.3" y1="2.5" x2="4.3" y2="-2.5" stroke="#BFDBFE" stroke-width="1.5"/>
        </g>
        <g transform="translate(40, 44)">
          <circle r="1.5" fill="#DBEAFE"/>
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#DBEAFE" stroke-width="1.2"/>
          <line x1="-3.5" y1="-2" x2="3.5" y2="2" stroke="#DBEAFE" stroke-width="1.2"/>
          <line x1="-3.5" y1="2" x2="3.5" y2="-2" stroke="#DBEAFE" stroke-width="1.2"/>
        </g>
        <g transform="translate(34, 52)">
          <circle r="2" fill="#93C5FD"/>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#93C5FD" stroke-width="1.5"/>
          <line x1="-4.3" y1="-2.5" x2="4.3" y2="2.5" stroke="#93C5FD" stroke-width="1.5"/>
          <line x1="-4.3" y1="2.5" x2="4.3" y2="-2.5" stroke="#93C5FD" stroke-width="1.5"/>
        </g>
      </g>
    </template>

    <!-- 雾天 -->
    <template v-else-if="type === 'foggy'">
      <g class="fog-lines">
        <rect x="10" y="18" width="44" height="4" rx="2" fill="#D1D5DB"/>
        <rect x="14" y="28" width="36" height="4" rx="2" fill="#E5E7EB"/>
        <rect x="8" y="38" width="48" height="4" rx="2" fill="#D1D5DB"/>
        <rect x="16" y="48" width="32" height="4" rx="2" fill="#E5E7EB"/>
      </g>
    </template>

    <!-- 默认 - 多云转晴 -->
    <template v-else>
      <!-- 太阳 -->
      <circle cx="44" cy="18" r="12" fill="url(#defaultSunGradient)"/>
      <!-- 光芒 -->
      <g opacity="0.6">
        <line x1="44" y1="2" x2="44" y2="6" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <line x1="56" y1="18" x2="60" y2="18" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
        <line x1="52.5" y1="9.5" x2="55.3" y2="6.7" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
      </g>
      <!-- 云朵 -->
      <path
        d="M42 48c3.9 0 7-3.1 7-7 0-3.5-2.5-6.4-5.9-6.9C42.5 29.5 38.5 26 34 26c-5.1 0-9.2 3.7-9.9 8.6C21.5 35.2 20 37.9 20 41c0 3.9 3.1 7 7 7h15z"
        fill="url(#defaultCloudGradient)"
      />
      <defs>
        <radialGradient id="defaultSunGradient" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#FEF3C7"/>
          <stop offset="100%" stop-color="#FBBF24"/>
        </radialGradient>
        <linearGradient id="defaultCloudGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#E5E7EB"/>
        </linearGradient>
      </defs>
    </template>
  </svg>
</template>

<style scoped>
.weather-icon {
  display: inline-block;
  vertical-align: middle;
}

/* 太阳光芒动画 */
.sun-rays {
  animation: rotate 20s linear infinite;
  transform-origin: 32px 32px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 雨滴动画 */
.rain-drops {
  animation: rainFall 1s ease-in-out infinite;
}

@keyframes rainFall {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.7; transform: translateY(2px); }
}

/* 雪花动画 */
.snowflakes {
  animation: snowFall 2s ease-in-out infinite;
}

@keyframes snowFall {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.8; transform: translateY(3px); }
}

/* 雾气动画 */
.fog-lines {
  animation: fogMove 4s ease-in-out infinite;
}

@keyframes fogMove {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.6; }
}
</style>
