<!--
  App.vue
  天气日历应用主组件
  
  需求: 1.1, 2.1, 3.1
  - 1.1: 以月视图形式展示当前月份的所有日期
  - 2.1: 用户点击黄历按钮或从右侧边缘滑动时，抽屉从侧边滑出
  - 3.1: 应用启动时请求用户位置权限并获取当地天气数据
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import WeatherBackground from './components/WeatherBackground.vue'
import WeatherIcon from './components/WeatherIcon.vue'
import CalendarView from './components/CalendarView.vue'
import AlmanacDrawer from './components/AlmanacDrawer.vue'
import { useCalendar } from './composables/useCalendar'
import { useWeather } from './composables/useWeather'
import { useAlmanac } from './composables/useAlmanac'

// 使用日历组合式函数
const {
  currentMonth,
  selectedDate,
  selectDate
} = useCalendar()

// 使用天气组合式函数 (传入 selectedDate，切换日期时自动刷新天气)
const {
  weatherData,
  weatherType,
  isLoading: weatherLoading,
  error: weatherError
} = useWeather(selectedDate)

// 使用黄历组合式函数
const {
  isDrawerOpen,
  openDrawer,
  closeDrawer
} = useAlmanac(selectedDate)

// 右侧边缘滑动检测
const touchStartX = ref(0)
const screenWidth = ref(window.innerWidth)

/**
 * 处理日期选择
 * Handle date selection from CalendarView
 * 如果选择的日期不在当前月，自动跳转到该月
 */
function handleDateSelect(date: Date): void {
  selectDate(date)
  // 如果选择的日期不在当前显示的月份，自动跳转
  if (date.getMonth() !== currentMonth.value.getMonth() || 
      date.getFullYear() !== currentMonth.value.getFullYear()) {
    currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
  }
}

/**
 * 处理月份切换
 * Handle month change from CalendarView
 */
function handleMonthChange(date: Date): void {
  currentMonth.value = date
}

/**
 * 格式化温度显示
 * Format temperature display
 */
const temperatureDisplay = computed<string>(() => {
  if (!weatherData.value) return '--°C'
  return `${Math.round(weatherData.value.temperature)}°C`
})

/**
 * 天气描述
 * Weather description
 */
const weatherDescription = computed<string>(() => {
  if (weatherError.value) return '天气获取失败'
  if (!weatherData.value) return '加载中...'
  return weatherData.value.weatherDesc
})

/**
 * 是否显示天气信息（天气获取成功时显示）
 */
const showWeatherInfo = computed<boolean>(() => {
  return !weatherError.value && weatherData.value !== null
})

/**
 * 是否为深色天气背景（需要浅色文字）
 */
const isDarkWeather = computed<boolean>(() => {
  return weatherType.value === 'rainy'
})

/**
 * 格式化选中日期显示（如：6月18日 周三）
 */
const dateDisplay = computed<string>(() => {
  const d = selectedDate.value
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
})

/**
 * 处理触摸开始 - 检测右侧边缘滑动
 * Handle touch start for edge swipe detection
 */
function handleTouchStart(event: TouchEvent): void {
  touchStartX.value = event.touches[0].clientX
}

/**
 * 处理触摸结束 - 从右侧边缘滑动打开黄历
 * Handle touch end for edge swipe to open almanac
 */
function handleTouchEnd(event: TouchEvent): void {
  const touchEndX = event.changedTouches[0].clientX
  const swipeDistance = touchStartX.value - touchEndX
  
  // 从右侧边缘（屏幕宽度的 90% 以上）向左滑动超过 50px 打开黄历
  if (touchStartX.value > screenWidth.value * 0.9 && swipeDistance > 50) {
    openDrawer()
  }
}

/**
 * 更新屏幕宽度
 * Update screen width on resize
 */
function handleResize(): void {
  screenWidth.value = window.innerWidth
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div
    class="app"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 天气动态背景 - Weather Background -->
    <WeatherBackground
      :weather-type="weatherType"
      :is-loading="weatherLoading"
    />
    
    <!-- 主内容区 - Main Content -->
    <main class="app__content">
      <!-- 头部区域 - Header with weather info -->
      <header class="app__header">
        <h1 class="app__title" :class="{ 'app__title--light': isDarkWeather }">天气日历</h1>
        
        <!-- 天气信息 - Weather Info (仅在天气获取成功时显示) -->
        <div v-if="showWeatherInfo" class="app__weather-info" :class="{ 'app__weather-info--dark': isDarkWeather }">
          <span class="app__weather-date">{{ dateDisplay }}</span>
          <WeatherIcon :type="weatherType" :size="28" class="app__weather-icon" />
          <span class="app__weather-temp">{{ temperatureDisplay }}</span>
          <span class="app__weather-desc">{{ weatherDescription }}</span>
        </div>
        
        <!-- 日期显示 (天气获取失败时只显示日期) -->
        <div v-else class="app__date-only" :class="{ 'app__date-only--dark': isDarkWeather }">
          <span class="app__weather-date">{{ dateDisplay }}</span>
        </div>
        
        <!-- 黄历按钮 - Almanac Button -->
        <button
          type="button"
          class="app__almanac-btn"
          aria-label="打开黄历"
          data-testid="almanac-open-btn"
          @click="openDrawer"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span class="app__almanac-btn-text">黄历</span>
        </button>
      </header>
      
      <!-- 日历视图 - Calendar View -->
      <CalendarView
        :current-date="currentMonth"
        :selected-date="selectedDate"
        @select="handleDateSelect"
        @month-change="handleMonthChange"
      />
    </main>
    
    <!-- 黄历抽屉 - Almanac Drawer -->
    <AlmanacDrawer
      :is-open="isDrawerOpen"
      :selected-date="selectedDate"
      @close="closeDrawer"
    />
  </div>
</template>

<style scoped>
/*
  响应式布局样式
  需求: 5.1, 5.2, 5.3, 5.4, 5.5
  - 5.1: 平板设备 (768px-1024px) 最优布局
  - 5.2: 手机设备 (<768px) 紧凑布局
  - 5.3: 电脑屏幕 (>1024px) 宽屏布局
  - 5.4: 设备方向变化自动重新布局
  - 5.5: 黄历抽屉在不同屏幕尺寸下保持可用性
*/

/* 应用容器 */
.app {
  @apply relative;
  @apply overflow-hidden;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
}

/* 主内容区 - 响应式布局 */
.app__content {
  @apply relative z-30;
  @apply flex flex-col;
  @apply transition-all duration-300 ease-out;
  min-height: 100vh;
  min-height: 100dvh;
  /* 安全区域适配 */
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  padding-top: 1.5rem;
}

/* 手机端 (<768px) - 紧凑布局 */
@media (max-width: 767px) {
  .app__content {
    @apply px-3 py-4;
  }
}

/* 平板端 (768px-1024px) - 最优布局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .app__content {
    @apply px-6 py-6;
    @apply max-w-3xl mx-auto;
  }
}

/* 桌面端 (>1024px) - 宽屏布局 */
@media (min-width: 1024px) {
  .app__content {
    @apply px-8 py-8;
    @apply max-w-5xl mx-auto;
  }
}

/* 大屏桌面端 (>1280px) */
@media (min-width: 1280px) {
  .app__content {
    @apply max-w-6xl;
  }
}

/* 横屏模式优化 - 需求 5.4 */
@media (orientation: landscape) and (max-height: 500px) {
  .app__content {
    @apply py-2;
  }
}

/* 头部区域 - 响应式布局 */
.app__header {
  @apply flex items-center justify-between;
  @apply flex-wrap gap-3;
  @apply mb-4;
  @apply transition-all duration-300 ease-out;
}

/* 手机端头部 - 垂直堆叠 */
@media (max-width: 767px) {
  .app__header {
    @apply flex-col items-stretch gap-3 mb-4;
  }
}

/* 平板端头部 */
@media (min-width: 768px) and (max-width: 1023px) {
  .app__header {
    @apply gap-4 mb-6;
  }
}

/* 桌面端头部 */
@media (min-width: 1024px) {
  .app__header {
    @apply gap-6 mb-8;
  }
}

/* 应用标题 - 响应式字体 (需求 4.1) */
.app__title {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-xl;
  @apply transition-all duration-300 ease-out;
  letter-spacing: 0.05em;
}

/* 深色天气背景下标题使用白色 */
.app__title--light {
  @apply text-white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (max-width: 767px) {
  .app__title {
    @apply text-xl text-center;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .app__title {
    @apply text-2xl;
  }
}

@media (min-width: 1024px) {
  .app__title {
    @apply text-3xl;
  }
}

/* 天气信息区 - 单行布局 */
.app__weather-info {
  @apply flex items-center gap-2;
  @apply bg-white/80 backdrop-blur-sm;
  @apply rounded-zen;
  @apply shadow-zen;
  @apply border border-zen-gray-200/30;
  @apply transition-all duration-300 ease-out;
  @apply hover:shadow-zen-md;
  @apply px-4 py-2;
}

/* 仅日期显示区（天气获取失败时） */
.app__date-only {
  @apply flex items-center;
  @apply bg-white/80 backdrop-blur-sm;
  @apply rounded-zen;
  @apply shadow-zen;
  @apply border border-zen-gray-200/30;
  @apply px-4 py-2;
}

.app__date-only--dark {
  @apply bg-white/20 border-white/20;
}

.app__date-only--dark .app__weather-date {
  @apply text-white;
}

@media (max-width: 767px) {
  .app__date-only {
    @apply px-3 py-1.5;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .app__date-only {
    @apply px-5 py-2.5;
  }
}

@media (min-width: 1024px) {
  .app__date-only {
    @apply px-6 py-3;
  }
}

/* 深色天气背景下天气卡片样式 */
.app__weather-info--dark {
  @apply bg-white/20 border-white/20;
}

.app__weather-info--dark .app__weather-date,
.app__weather-info--dark .app__weather-temp,
.app__weather-info--dark .app__weather-desc {
  @apply text-white;
}

@media (max-width: 767px) {
  .app__weather-info {
    @apply px-3 py-1.5 gap-1.5;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .app__weather-info {
    @apply px-5 py-2.5 gap-2.5;
  }
}

@media (min-width: 1024px) {
  .app__weather-info {
    @apply px-6 py-3 gap-3;
  }
}

.app__weather-date {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-sm;
}

.app__weather-icon {
  @apply flex-shrink-0;
}

.app__weather-temp {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-sm;
}

.app__weather-desc {
  @apply text-zen-gray-500;
  @apply text-sm;
}

@media (min-width: 768px) {
  .app__weather-date,
  .app__weather-temp,
  .app__weather-desc {
    @apply text-base;
  }
}

/* 黄历按钮 - 响应式布局 (需求 4.5: 柔和交互反馈) */
.app__almanac-btn {
  @apply flex items-center gap-2;
  @apply bg-zen-bamboo-400 text-white;
  @apply rounded-zen;
  @apply shadow-zen;
  @apply transition-all duration-200 ease-out;
  @apply hover:bg-zen-bamboo-500 hover:shadow-zen-md hover:-translate-y-px;
  @apply focus:outline-none focus:ring-2 focus:ring-zen-bamboo-300 focus:ring-offset-1;
  @apply active:scale-95 active:translate-y-0;
  @apply px-3 py-1.5;
}

@media (max-width: 767px) {
  .app__almanac-btn {
    @apply justify-center px-4 py-2;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .app__almanac-btn {
    @apply px-4 py-2;
  }
}

@media (min-width: 1024px) {
  .app__almanac-btn {
    @apply px-5 py-2.5;
  }
}

.app__almanac-btn-text {
  @apply font-medium text-sm;
}

@media (min-width: 768px) {
  .app__almanac-btn-text {
    @apply text-base;
  }
}
</style>
