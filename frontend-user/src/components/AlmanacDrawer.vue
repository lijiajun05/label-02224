<!--
  AlmanacDrawer.vue
  黄历侧边抽屉组件
  
  需求: 2.1, 2.2, 2.3, 2.4, 2.5
  - 2.1: 用户点击黄历按钮或从右侧边缘滑动时，抽屉从侧边滑出
  - 2.2: 显示选中日期的天干地支、五行、冲煞信息
  - 2.3: 显示当日宜忌事项列表
  - 2.4: 显示当日吉时信息
  - 2.5: 用户点击抽屉外部区域或关闭按钮时，抽屉平滑收回隐藏
-->
<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import type { AlmanacDrawerProps } from '../types'
import { getAlmanacData } from '../services/almanacService'

const props = defineProps<AlmanacDrawerProps>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 抽屉元素引用
const drawerRef = ref<HTMLElement | null>(null)

// 滑动手势状态
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)

/**
 * 根据选中日期获取黄历数据
 * Get almanac data based on selected date
 */
const almanacData = computed(() => {
  if (!props.selectedDate) {
    return null
  }
  return getAlmanacData(props.selectedDate)
})

/**
 * 格式化公历日期
 * Format solar date (e.g., "2024年1月15日 星期一")
 */
const formattedSolarDate = computed(() => {
  if (!props.selectedDate) return ''
  const date = props.selectedDate
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日 星期${weekDay}`
})

/**
 * 格式化农历日期
 * Format lunar date (e.g., "甲辰年 腊月初六")
 */
const formattedLunarDate = computed(() => {
  if (!almanacData.value) return ''
  const lunar = almanacData.value.lunarDate
  return `${lunar.yearCn} ${lunar.monthCn}${lunar.dayCn}`
})

/**
 * 处理点击遮罩层关闭
 * Handle backdrop click to close drawer
 */
function handleBackdropClick(event: MouseEvent): void {
  // 只有点击遮罩层本身才关闭
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

/**
 * 处理关闭按钮点击
 * Handle close button click
 */
function handleClose(): void {
  emit('close')
}

/**
 * 处理键盘事件 (ESC 关闭)
 * Handle keyboard events (ESC to close)
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

/**
 * 处理触摸开始
 * Handle touch start for swipe gesture
 */
function handleTouchStart(event: TouchEvent): void {
  touchStartX.value = event.touches[0].clientX
  touchCurrentX.value = event.touches[0].clientX
  isSwiping.value = true
}

/**
 * 处理触摸移动
 * Handle touch move for swipe gesture
 */
function handleTouchMove(event: TouchEvent): void {
  if (!isSwiping.value) return
  touchCurrentX.value = event.touches[0].clientX
}

/**
 * 处理触摸结束
 * Handle touch end for swipe gesture
 */
function handleTouchEnd(): void {
  if (!isSwiping.value) return
  
  const swipeDistance = touchCurrentX.value - touchStartX.value
  // 向右滑动超过 50px 则关闭抽屉
  if (swipeDistance > 50) {
    emit('close')
  }
  
  isSwiping.value = false
  touchStartX.value = 0
  touchCurrentX.value = 0
}

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 当抽屉打开时，阻止背景滚动
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="almanac-drawer">
      <div
        v-if="isOpen"
        class="almanac-drawer__backdrop"
        data-testid="almanac-drawer-backdrop"
        @click="handleBackdropClick"
      >
        <aside
          ref="drawerRef"
          class="almanac-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="almanac-drawer-title"
          data-testid="almanac-drawer"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- 抽屉头部 - Drawer Header -->
          <header class="almanac-drawer__header">
            <h2
              id="almanac-drawer-title"
              class="almanac-drawer__title"
            >
              黄历
            </h2>
            <button
              type="button"
              class="almanac-drawer__close-btn"
              aria-label="关闭黄历"
              data-testid="almanac-drawer-close"
              @click="handleClose"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <!-- 抽屉内容 - Drawer Content -->
          <div
            v-if="almanacData"
            class="almanac-drawer__content"
          >
            <!-- 日期信息 - Date Info -->
            <section class="almanac-drawer__section">
              <div
                class="almanac-drawer__date-solar"
                data-testid="almanac-solar-date"
              >
                {{ formattedSolarDate }}
              </div>
              <div
                class="almanac-drawer__date-lunar"
                data-testid="almanac-lunar-date"
              >
                {{ formattedLunarDate }}
              </div>
            </section>

            <!-- 天干地支 - Gan Zhi -->
            <section class="almanac-drawer__section">
              <h3 class="almanac-drawer__section-title">天干地支</h3>
              <div
                class="almanac-drawer__ganzhi"
                data-testid="almanac-ganzhi"
              >
                <div class="almanac-drawer__ganzhi-item">
                  <span class="almanac-drawer__ganzhi-label">年柱</span>
                  <span class="almanac-drawer__ganzhi-value">{{ almanacData.ganZhi.year }}</span>
                </div>
                <div class="almanac-drawer__ganzhi-item">
                  <span class="almanac-drawer__ganzhi-label">月柱</span>
                  <span class="almanac-drawer__ganzhi-value">{{ almanacData.ganZhi.month }}</span>
                </div>
                <div class="almanac-drawer__ganzhi-item">
                  <span class="almanac-drawer__ganzhi-label">日柱</span>
                  <span class="almanac-drawer__ganzhi-value">{{ almanacData.ganZhi.day }}</span>
                </div>
              </div>
            </section>

            <!-- 五行冲煞 - Five Elements & Clash -->
            <section class="almanac-drawer__section">
              <h3 class="almanac-drawer__section-title">五行冲煞</h3>
              <div
                class="almanac-drawer__info-row"
                data-testid="almanac-wuxing"
              >
                <span class="almanac-drawer__info-label">五行</span>
                <span class="almanac-drawer__info-value">{{ almanacData.fiveElements }}</span>
              </div>
              <div
                class="almanac-drawer__info-row"
                data-testid="almanac-clash"
              >
                <span class="almanac-drawer__info-label">冲煞</span>
                <span class="almanac-drawer__info-value">{{ almanacData.clash }}</span>
              </div>
            </section>

            <!-- 宜 - Suitable Activities -->
            <section class="almanac-drawer__section">
              <h3 class="almanac-drawer__section-title almanac-drawer__section-title--suitable">
                宜
              </h3>
              <div
                class="almanac-drawer__activities"
                data-testid="almanac-suitable"
              >
                <span
                  v-for="activity in almanacData.suitable"
                  :key="activity"
                  class="almanac-drawer__activity almanac-drawer__activity--suitable"
                >
                  {{ activity }}
                </span>
              </div>
            </section>

            <!-- 忌 - Avoid Activities -->
            <section class="almanac-drawer__section">
              <h3 class="almanac-drawer__section-title almanac-drawer__section-title--avoid">
                忌
              </h3>
              <div
                class="almanac-drawer__activities"
                data-testid="almanac-avoid"
              >
                <span
                  v-for="activity in almanacData.avoid"
                  :key="activity"
                  class="almanac-drawer__activity almanac-drawer__activity--avoid"
                >
                  {{ activity }}
                </span>
              </div>
            </section>

            <!-- 吉时 - Lucky Hours -->
            <section class="almanac-drawer__section">
              <h3 class="almanac-drawer__section-title">吉时</h3>
              <div
                class="almanac-drawer__lucky-hours"
                data-testid="almanac-lucky-hours"
              >
                <div
                  v-for="hour in almanacData.luckyHours"
                  :key="hour"
                  class="almanac-drawer__lucky-hour"
                >
                  {{ hour }}
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/*
  黄历抽屉响应式样式
  需求: 5.5 - 黄历抽屉在不同屏幕尺寸下保持可用性和美观性
  需求: 5.1, 5.2, 5.3, 5.4 - 响应式布局适配
*/

/* 遮罩层 */
.almanac-drawer__backdrop {
  @apply fixed inset-0 z-50;
  @apply bg-black/30 backdrop-blur-sm;
  @apply flex justify-end;
}

/* 抽屉容器 - 响应式宽度 (需求 4.1, 4.2) */
.almanac-drawer {
  @apply h-full;
  @apply bg-zen-cream-50;
  @apply shadow-zen-lg;
  @apply flex flex-col;
  @apply overflow-hidden;
  @apply transition-all duration-300 ease-out;
  @apply border-l border-zen-gray-200/40;
  /* 默认宽度 */
  @apply w-72;
  max-width: 85vw;
}

/* 手机端 (<768px) - 全屏或接近全屏宽度 */
@media (max-width: 767px) {
  .almanac-drawer {
    @apply w-full;
    max-width: 100vw;
  }
}

/* 平板端 (768px-1024px) - 适中宽度 */
@media (min-width: 768px) and (max-width: 1023px) {
  .almanac-drawer {
    @apply w-80;
    max-width: 50vw;
  }
}

/* 桌面端 (>1024px) - 固定宽度 */
@media (min-width: 1024px) {
  .almanac-drawer {
    @apply w-96;
    max-width: 400px;
  }
}

/* 大屏桌面端 (>1280px) */
@media (min-width: 1280px) {
  .almanac-drawer {
    @apply w-[420px];
    max-width: 420px;
  }
}

/* 横屏模式优化 - 需求 5.4 */
@media (orientation: landscape) and (max-height: 500px) {
  .almanac-drawer {
    @apply w-72;
    max-width: 40vw;
  }
}

/* 抽屉头部 - 响应式内边距 (需求 4.1) */
.almanac-drawer__header {
  @apply flex items-center justify-between;
  @apply border-b border-zen-gray-200/50;
  @apply bg-white/60 backdrop-blur-sm;
  @apply px-4 py-3;
  /* 安全区域适配 */
  padding-right: max(1rem, env(safe-area-inset-right));
}

@media (max-width: 767px) {
  .almanac-drawer__header {
    @apply px-4 py-3;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .almanac-drawer__header {
    @apply px-5 py-4;
  }
}

@media (min-width: 1024px) {
  .almanac-drawer__header {
    @apply px-6 py-4;
  }
}

/* 抽屉标题 - 响应式字体 */
.almanac-drawer__title {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-lg;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .almanac-drawer__title {
    @apply text-xl;
  }
}

@media (min-width: 1024px) {
  .almanac-drawer__title {
    @apply text-xl;
  }
}

/* 关闭按钮 - 响应式大小 (需求 4.5) */
.almanac-drawer__close-btn {
  @apply rounded-full;
  @apply text-zen-gray-400;
  @apply transition-all duration-200 ease-out;
  @apply hover:bg-zen-gray-100 hover:text-zen-gray-600;
  @apply focus:outline-none focus:ring-2 focus:ring-zen-blue-300 focus:ring-offset-1;
  @apply active:scale-90;
  @apply p-1.5;
}

@media (min-width: 768px) {
  .almanac-drawer__close-btn {
    @apply p-2;
  }
}

/* 抽屉内容区 - 响应式内边距和间距 */
.almanac-drawer__content {
  @apply flex-1 overflow-y-auto;
  @apply px-4 py-3;
  @apply space-y-4;
  /* 安全区域适配 */
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

@media (max-width: 767px) {
  .almanac-drawer__content {
    @apply px-4 py-3 space-y-3;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .almanac-drawer__content {
    @apply px-5 py-4 space-y-4;
  }
}

@media (min-width: 1024px) {
  .almanac-drawer__content {
    @apply px-6 py-5 space-y-5;
  }
}

/* 内容区块 - 卡片式布局 (需求 4.2) */
.almanac-drawer__section {
  @apply space-y-2;
  @apply bg-white/50 rounded-lg;
  @apply px-3 py-2.5;
  @apply border border-zen-gray-200/30;
}

@media (max-width: 767px) {
  .almanac-drawer__section {
    @apply space-y-1.5 px-2.5 py-2;
  }
}

/* 区块标题 - 响应式字体 (需求 4.1) */
.almanac-drawer__section-title {
  @apply font-medium;
  @apply text-zen-gray-500;
  @apply pb-1 border-b border-zen-gray-200/40;
  @apply text-xs;
  letter-spacing: 0.03em;
}

@media (min-width: 768px) {
  .almanac-drawer__section-title {
    @apply text-sm;
  }
}

.almanac-drawer__section-title--suitable {
  @apply text-zen-bamboo-600;
  @apply border-zen-bamboo-300;
}

.almanac-drawer__section-title--avoid {
  @apply text-red-500;
  @apply border-red-200;
}

/* 日期显示 - 响应式字体 */
.almanac-drawer__date-solar {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-base;
}

.almanac-drawer__date-lunar {
  @apply text-zen-gray-500;
  @apply text-sm;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .almanac-drawer__date-solar {
    @apply text-lg;
  }
  
  .almanac-drawer__date-lunar {
    @apply text-base;
  }
}

@media (min-width: 1024px) {
  .almanac-drawer__date-solar {
    @apply text-lg;
  }
  
  .almanac-drawer__date-lunar {
    @apply text-base;
  }
}

/* 天干地支 - 响应式布局 */
.almanac-drawer__ganzhi {
  @apply flex gap-2;
  @apply flex-wrap;
}

@media (min-width: 768px) {
  .almanac-drawer__ganzhi {
    @apply gap-3;
  }
}

@media (min-width: 1024px) {
  .almanac-drawer__ganzhi {
    @apply gap-4;
  }
}

.almanac-drawer__ganzhi-item {
  @apply flex flex-col items-center;
  @apply bg-zen-cream-100/80 rounded-lg;
  @apply px-2 py-1.5;
  @apply flex-1 min-w-0;
  @apply border border-zen-cream-300/40;
  @apply transition-all duration-200 ease-out;
}

@media (min-width: 768px) {
  .almanac-drawer__ganzhi-item {
    @apply px-3 py-2;
  }
}

.almanac-drawer__ganzhi-label {
  @apply text-zen-gray-500;
  @apply text-xs;
}

.almanac-drawer__ganzhi-value {
  @apply font-zen font-medium;
  @apply text-zen-gray-600;
  @apply text-base;
}

@media (min-width: 768px) {
  .almanac-drawer__ganzhi-value {
    @apply text-lg;
  }
}

/* 信息行 - 响应式字体 */
.almanac-drawer__info-row {
  @apply flex items-center gap-2;
  @apply py-0.5;
}

@media (min-width: 768px) {
  .almanac-drawer__info-row {
    @apply gap-3 py-1;
  }
}

.almanac-drawer__info-label {
  @apply text-zen-gray-500;
  @apply text-xs w-10;
}

.almanac-drawer__info-value {
  @apply text-zen-gray-600;
  @apply text-xs;
}

@media (min-width: 768px) {
  .almanac-drawer__info-label {
    @apply text-sm w-12;
  }
  
  .almanac-drawer__info-value {
    @apply text-sm;
  }
}

/* 宜忌事项 - 响应式布局 */
.almanac-drawer__activities {
  @apply flex flex-wrap gap-1.5;
}

@media (min-width: 768px) {
  .almanac-drawer__activities {
    @apply gap-2;
  }
}

.almanac-drawer__activity {
  @apply rounded-md;
  @apply text-xs px-1.5 py-0.5;
  @apply transition-all duration-150 ease-out;
}

@media (min-width: 768px) {
  .almanac-drawer__activity {
    @apply text-sm px-2 py-1;
  }
}

.almanac-drawer__activity--suitable {
  @apply bg-zen-bamboo-100 text-zen-bamboo-600;
}

.almanac-drawer__activity--avoid {
  @apply bg-red-50 text-red-500;
}

/* 吉时 - 响应式网格 */
.almanac-drawer__lucky-hours {
  @apply grid gap-1.5;
  @apply grid-cols-2;
}

@media (min-width: 768px) {
  .almanac-drawer__lucky-hours {
    @apply gap-2;
  }
}

/* 横屏模式下使用更多列 */
@media (orientation: landscape) and (max-height: 500px) {
  .almanac-drawer__lucky-hours {
    @apply grid-cols-3;
  }
}

.almanac-drawer__lucky-hour {
  @apply text-center;
  @apply bg-zen-blue-50/80 text-zen-blue-500;
  @apply rounded-md;
  @apply border border-zen-blue-100/50;
  @apply text-xs px-2 py-1.5;
  @apply transition-all duration-150 ease-out;
}

@media (min-width: 768px) {
  .almanac-drawer__lucky-hour {
    @apply text-sm px-3 py-2;
  }
}

/* 过渡动画 */
.almanac-drawer-enter-active .almanac-drawer__backdrop,
.almanac-drawer-leave-active .almanac-drawer__backdrop {
  transition: opacity 0.3s ease;
}

.almanac-drawer-enter-active .almanac-drawer,
.almanac-drawer-leave-active .almanac-drawer {
  transition: transform 0.3s ease;
}

.almanac-drawer-enter-from .almanac-drawer__backdrop,
.almanac-drawer-leave-to .almanac-drawer__backdrop {
  opacity: 0;
}

.almanac-drawer-enter-from .almanac-drawer,
.almanac-drawer-leave-to .almanac-drawer {
  transform: translateX(100%);
}
</style>
