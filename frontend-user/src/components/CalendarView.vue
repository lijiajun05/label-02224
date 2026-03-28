<!--
  CalendarView.vue
  日历主视图组件
  
  需求: 1.1, 1.2, 1.3, 4.2, 4.3
  - 1.1: 以月视图形式展示当前月份的所有日期
  - 1.2: 高亮选中的日期并显示该日期的详细信息
  - 1.3: 使用卷轴展开动效切换到目标月份
  - 4.2: 采用卡片式布局呈现日期信息
  - 4.3: 使用仿古卷轴展开效果作为过渡动画
-->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CalendarViewProps } from '../types'
import { useCalendar } from '../composables/useCalendar'
import { isSameDay } from '../utils/dateUtils'
import CalendarCell from './CalendarCell.vue'

const props = defineProps<CalendarViewProps>()

const emit = defineEmits<{
  (e: 'select', date: Date): void
  (e: 'monthChange', date: Date): void
}>()

// 使用日历组合式函数
const {
  currentMonth,
  selectedDate,
  calendarDays,
  selectDate,
  nextMonth,
  prevMonth
} = useCalendar()

// 卷轴展开动画状态
const isAnimating = ref(false)
const animationKey = ref(0)

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 格式化月份标题
 * Format month title (e.g., "2024年1月")
 */
const monthTitle = computed<string>(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

/**
 * 同步外部传入的日期
 * Sync with external props
 */
watch(
  () => props.currentDate,
  (newDate) => {
    if (newDate) {
      currentMonth.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
    }
  },
  { immediate: true }
)

watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) {
      selectDate(newDate)
    }
  },
  { immediate: true }
)

/**
 * 触发卷轴展开动画
 * Trigger scroll unfold animation
 */
function triggerAnimation(): void {
  isAnimating.value = true
  animationKey.value++
  setTimeout(() => {
    isAnimating.value = false
  }, 500)
}

/**
 * 处理上一月切换
 * Handle previous month navigation
 */
function handlePrevMonth(): void {
  triggerAnimation()
  prevMonth()
  emit('monthChange', currentMonth.value)
}

/**
 * 处理下一月切换
 * Handle next month navigation
 */
function handleNextMonth(): void {
  triggerAnimation()
  nextMonth()
  emit('monthChange', currentMonth.value)
}

/**
 * 处理日期选择
 * Handle date selection
 */
function handleDateSelect(date: Date): void {
  selectDate(date)
  emit('select', date)
}

/**
 * 判断日期是否被选中
 * Check if date is selected
 */
function isDateSelected(date: Date): boolean {
  return isSameDay(date, selectedDate.value)
}
</script>

<template>
  <div
    class="calendar-view"
    data-testid="calendar-view"
  >
    <!-- 月份标题和导航 - Month header with navigation -->
    <header class="calendar-view__header" data-testid="calendar-header">
      <button
        type="button"
        class="calendar-view__nav-btn"
        aria-label="上一月"
        data-testid="prev-month-btn"
        @click="handlePrevMonth"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      
      <h2
        class="calendar-view__title"
        data-testid="month-title"
      >
        {{ monthTitle }}
      </h2>
      
      <button
        type="button"
        class="calendar-view__nav-btn"
        aria-label="下一月"
        data-testid="next-month-btn"
        @click="handleNextMonth"
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </header>
    
    <!-- 星期标题行 - Weekday headers -->
    <div
      class="calendar-view__weekdays"
      role="row"
      data-testid="weekday-headers"
    >
      <div
        v-for="day in weekDays"
        :key="day"
        class="calendar-view__weekday"
        role="columnheader"
      >
        {{ day }}
      </div>
    </div>
    
    <!-- 日期网格 - Date grid with scroll unfold animation -->
    <div
      :key="animationKey"
      class="calendar-view__grid"
      :class="{ 'calendar-view__grid--animating': isAnimating }"
      role="grid"
      :aria-label="`${monthTitle}日历`"
      data-testid="calendar-grid"
    >
      <CalendarCell
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        :date="day.date"
        :lunar-date="day.lunarDate"
        :is-today="day.isToday"
        :is-selected="isDateSelected(day.date)"
        :is-current-month="day.isCurrentMonth"
        :festival="day.festival"
        @select="handleDateSelect"
      />
    </div>
  </div>
</template>

<style scoped>
/*
  日历视图响应式样式
  需求: 5.1, 5.2, 5.3, 5.4
  - 5.1: 平板设备 (768px-1024px) 最优布局
  - 5.2: 手机设备 (<768px) 紧凑布局
  - 5.3: 电脑屏幕 (>1024px) 宽屏布局
  - 5.4: 设备方向变化自动重新布局
*/

/* 日历视图容器 - 卡片式布局 (需求 4.2) */
.calendar-view {
  @apply bg-white/70 backdrop-blur-sm;
  @apply rounded-zen shadow-zen-md;
  @apply border border-zen-gray-200/30;
  @apply w-full mx-auto;
  @apply transition-all duration-300 ease-out;
  @apply p-3;
}

/* 手机端 (<768px) - 紧凑布局 */
@media (max-width: 767px) {
  .calendar-view {
    @apply p-2 rounded-lg;
    @apply max-w-full;
  }
}

/* 平板端 (768px-1024px) - 最优布局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view {
    @apply p-5;
    @apply max-w-xl;
  }
}

/* 桌面端 (>1024px) - 宽屏布局 */
@media (min-width: 1024px) {
  .calendar-view {
    @apply p-6;
    @apply max-w-2xl;
  }
}

/* 大屏桌面端 (>1280px) */
@media (min-width: 1280px) {
  .calendar-view {
    @apply p-8;
    @apply max-w-3xl;
  }
}

/* 横屏模式优化 - 需求 5.4 */
@media (orientation: landscape) and (max-height: 500px) {
  .calendar-view {
    @apply p-2;
    @apply max-w-lg;
  }
}

/* 头部区域 */
.calendar-view__header {
  @apply flex items-center justify-between;
  @apply mb-3;
  @apply transition-all duration-300 ease-out;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view__header {
    @apply mb-4;
  }
}

@media (min-width: 1024px) {
  .calendar-view__header {
    @apply mb-5;
  }
}

/* 月份标题 - 响应式字体 */
.calendar-view__title {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-lg;
  @apply transition-all duration-300 ease-out;
}

@media (max-width: 767px) {
  .calendar-view__title {
    @apply text-base;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view__title {
    @apply text-xl;
  }
}

@media (min-width: 1024px) {
  .calendar-view__title {
    @apply text-2xl;
  }
}

/* 导航按钮 - 响应式大小 (需求 4.5: 柔和交互反馈) */
.calendar-view__nav-btn {
  @apply rounded-full;
  @apply text-zen-gray-500;
  @apply bg-transparent;
  @apply transition-all duration-200 ease-out;
  @apply hover:bg-zen-blue-100 hover:text-zen-blue-500 hover:shadow-zen;
  @apply focus:outline-none focus:ring-2 focus:ring-zen-blue-300 focus:ring-offset-1;
  @apply active:scale-90 active:bg-zen-blue-200;
  @apply p-1.5;
}

@media (max-width: 767px) {
  .calendar-view__nav-btn {
    @apply p-1;
  }
  
  .calendar-view__nav-btn svg {
    @apply w-4 h-4;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view__nav-btn {
    @apply p-2;
  }
  
  .calendar-view__nav-btn svg {
    @apply w-5 h-5;
  }
}

@media (min-width: 1024px) {
  .calendar-view__nav-btn {
    @apply p-2.5;
  }
  
  .calendar-view__nav-btn svg {
    @apply w-6 h-6;
  }
}

/* 星期标题行 */
.calendar-view__weekdays {
  @apply grid grid-cols-7;
  @apply mb-1;
  @apply gap-0.5;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view__weekdays {
    @apply mb-2 gap-1;
  }
}

@media (min-width: 1024px) {
  .calendar-view__weekdays {
    @apply mb-3 gap-1;
  }
}

/* 单个星期标题 - 响应式字体 (需求 4.1) */
.calendar-view__weekday {
  @apply text-center font-medium;
  @apply text-zen-gray-400;
  @apply text-xs py-1;
  letter-spacing: 0.05em;
}

@media (max-width: 767px) {
  .calendar-view__weekday {
    @apply text-xs py-1;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view__weekday {
    @apply text-sm py-2;
  }
}

@media (min-width: 1024px) {
  .calendar-view__weekday {
    @apply text-base py-3;
  }
}

/* 日期网格 - 响应式间距 */
.calendar-view__grid {
  @apply grid grid-cols-7;
  @apply origin-top;
  @apply transition-all duration-500 ease-out;
  @apply gap-0.5;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-view__grid {
    @apply gap-1;
  }
}

@media (min-width: 1024px) {
  .calendar-view__grid {
    @apply gap-1.5;
  }
}

/* 卷轴展开动画 */
.calendar-view__grid--animating {
  @apply animate-scroll-unfold;
}
</style>
