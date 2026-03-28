<!--
  CalendarCell.vue
  日历单元格组件
  
  需求: 1.4, 1.5, 1.6
  - 1.4: 同时展示公历日期和对应的农历日期
  - 1.5: 以特殊样式标识今天的日期
  - 1.6: 以醒目但不突兀的方式标注节日名称
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarCellProps } from '../types'

const props = defineProps<CalendarCellProps>()

const emit = defineEmits<{
  (e: 'select', date: Date): void
}>()

/**
 * 获取公历日期数字
 * Get solar date day number
 */
const solarDay = computed<number>(() => {
  return props.date.getDate()
})

/**
 * 获取显示的农历文本
 * 如果有节日则显示节日名称，否则显示农历日期
 * Get lunar text to display - festival name if present, otherwise lunar date
 */
const lunarText = computed<string>(() => {
  if (props.festival) {
    return props.festival
  }
  return props.lunarDate.dayCn
})

/**
 * 判断是否显示节日样式
 * Check if festival styling should be applied
 */
const hasFestival = computed<boolean>(() => {
  return !!props.festival
})

/**
 * 处理单元格点击事件
 * Handle cell click event
 */
function handleClick(): void {
  emit('select', props.date)
}
</script>

<template>
  <button
    type="button"
    class="calendar-cell"
    :class="{
      'calendar-cell--today': isToday,
      'calendar-cell--selected': isSelected,
      'calendar-cell--other-month': !isCurrentMonth
    }"
    :aria-label="`${date.getFullYear()}年${date.getMonth() + 1}月${solarDay}日，农历${lunarDate.monthCn}${lunarDate.dayCn}${festival ? '，' + festival : ''}`"
    :aria-pressed="isSelected"
    :aria-current="isToday ? 'date' : undefined"
    data-testid="calendar-cell"
    @click="handleClick"
  >
    <!-- 公历日期 - Solar date -->
    <span
      class="calendar-cell__solar"
      :class="{ 'calendar-cell__solar--today': isToday }"
      data-testid="solar-date"
    >
      {{ solarDay }}
    </span>
    
    <!-- 农历日期或节日 - Lunar date or festival -->
    <span
      class="calendar-cell__lunar"
      :class="{ 'calendar-cell__lunar--festival': hasFestival }"
      data-testid="lunar-date"
    >
      {{ lunarText }}
    </span>
  </button>
</template>

<style scoped>
/*
  日历单元格响应式样式
  需求: 5.1, 5.2, 5.3, 5.4
  - 5.1: 平板设备 (768px-1024px) 最优布局
  - 5.2: 手机设备 (<768px) 紧凑布局
  - 5.3: 电脑屏幕 (>1024px) 宽屏布局
  - 5.4: 设备方向变化自动重新布局
*/

/* 需求 4.2: 卡片式布局 / 需求 4.5: 柔和交互反馈 */
.calendar-cell {
  @apply relative flex flex-col items-center justify-center;
  @apply w-full aspect-square;
  @apply rounded-zen cursor-pointer;
  @apply bg-white/50;
  @apply border border-transparent;
  @apply transition-all duration-200 ease-out;
  @apply hover:bg-zen-blue-50 hover:shadow-zen hover:border-zen-blue-100;
  @apply hover:-translate-y-px;
  @apply focus:outline-none focus:ring-2 focus:ring-zen-blue-300 focus:ring-offset-1;
  @apply active:scale-[0.96] active:shadow-none;
  @apply p-0.5;
}

/* 手机端 (<768px) - 紧凑布局 */
@media (max-width: 767px) {
  .calendar-cell {
    @apply p-0.5 rounded-lg;
  }
}

/* 平板端 (768px-1024px) - 最优布局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-cell {
    @apply p-1;
  }
}

/* 桌面端 (>1024px) - 宽屏布局 */
@media (min-width: 1024px) {
  .calendar-cell {
    @apply p-1.5;
  }
}

/* 横屏模式优化 - 需求 5.4 */
@media (orientation: landscape) and (max-height: 500px) {
  .calendar-cell {
    @apply p-0.5;
  }
}

/* 今日样式 - Today styling (需求 1.5, 4.1) */
.calendar-cell--today {
  @apply bg-zen-blue-100/80 border-zen-blue-200;
  @apply shadow-zen;
}

.calendar-cell--today::before {
  content: '';
  @apply absolute rounded-full border-2 border-zen-blue-400;
  @apply pointer-events-none;
  @apply inset-1;
}

@media (max-width: 767px) {
  .calendar-cell--today::before {
    @apply inset-0.5;
  }
}

@media (min-width: 1024px) {
  .calendar-cell--today::before {
    @apply inset-2;
  }
}

/* 选中样式 - Selected styling (需求 4.5) */
.calendar-cell--selected {
  @apply bg-zen-bamboo-100 border-zen-bamboo-300 shadow-zen;
}

.calendar-cell--selected:hover {
  @apply bg-zen-bamboo-200 shadow-zen-md;
}

/* 非当前月份样式 - Other month styling */
.calendar-cell--other-month {
  @apply opacity-40;
}

.calendar-cell--other-month:hover {
  @apply opacity-60;
}

/* 公历日期样式 - Solar date styling - 响应式字体 */
.calendar-cell__solar {
  @apply font-medium text-zen-gray-600;
  @apply leading-tight;
  @apply text-sm;
}

@media (max-width: 767px) {
  .calendar-cell__solar {
    @apply text-xs;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-cell__solar {
    @apply text-base;
  }
}

@media (min-width: 1024px) {
  .calendar-cell__solar {
    @apply text-lg;
  }
}

/* 横屏模式 */
@media (orientation: landscape) and (max-height: 500px) {
  .calendar-cell__solar {
    @apply text-xs;
  }
}

.calendar-cell__solar--today {
  @apply text-zen-blue-500 font-bold;
}

.calendar-cell--selected .calendar-cell__solar {
  @apply text-zen-bamboo-600;
}

.calendar-cell--other-month .calendar-cell__solar {
  @apply text-zen-gray-400;
}

/* 农历日期样式 - Lunar date styling - 响应式字体 */
.calendar-cell__lunar {
  @apply text-zen-gray-500;
  @apply leading-tight;
  @apply truncate max-w-full;
  @apply text-xs mt-0;
}

@media (max-width: 767px) {
  .calendar-cell__lunar {
    font-size: 0.625rem; /* 10px */
    @apply mt-0;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-cell__lunar {
    @apply text-xs mt-0.5;
  }
}

@media (min-width: 1024px) {
  .calendar-cell__lunar {
    @apply text-sm mt-1;
  }
}

/* 横屏模式 */
@media (orientation: landscape) and (max-height: 500px) {
  .calendar-cell__lunar {
    font-size: 0.625rem;
    @apply mt-0;
  }
}

.calendar-cell--other-month .calendar-cell__lunar {
  @apply text-zen-gray-400;
}

/* 节日样式 - Festival styling */
.calendar-cell__lunar--festival {
  @apply text-zen-bamboo-600 font-medium;
}

.calendar-cell--other-month .calendar-cell__lunar--festival {
  @apply text-zen-bamboo-400;
}
</style>
