/**
 * 天气日历应用类型定义
 * Zen Calendar App Type Definitions
 */

// ============================================
// 天气相关类型 (Weather Related Types)
// ============================================

/**
 * 天气类型
 * Weather type enumeration
 */
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'default'

/**
 * 粒子类型
 * Particle type for weather animations
 */
export type ParticleType = 'rain' | 'snow' | 'dust' | 'cloud' | 'fog' | 'none'

/**
 * 天气数据接口
 * Weather data from API
 */
export interface WeatherData {
  location: string
  temperature: number
  weatherCode: number
  weatherDesc: string
  humidity: number
  windSpeed: number
  updateTime: Date
}

/**
 * 粒子接口
 * Single particle for weather animation
 */
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  /** 旋转角度（雪花、云朵使用） */
  rotation?: number
  /** 旋转速度 */
  rotationSpeed?: number
  /** 闪烁相位（光斑使用） */
  twinklePhase?: number
  /** 闪烁速度 */
  twinkleSpeed?: number
  /** 颜色（可选，用于多彩粒子） */
  color?: string
}

// ============================================
// 日历相关类型 (Calendar Related Types)
// ============================================

/**
 * 农历日期接口
 * Lunar calendar date
 */
export interface LunarDate {
  year: number        // 农历年
  month: number       // 农历月
  day: number         // 农历日
  yearCn: string      // 年份中文（如：甲辰年）
  monthCn: string     // 月份中文（如：正月）
  dayCn: string       // 日期中文（如：初一）
  isLeapMonth: boolean
}

/**
 * 日历日期接口
 * Calendar day with lunar date and metadata
 */
export interface CalendarDay {
  date: Date
  lunarDate: LunarDate
  isToday: boolean
  isCurrentMonth: boolean
  festival?: string
  solarTerm?: string
}

// ============================================
// 黄历相关类型 (Almanac Related Types)
// ============================================

/**
 * 天干地支接口
 * Heavenly Stems and Earthly Branches
 */
export interface GanZhi {
  year: string   // 年柱（如：甲辰）
  month: string  // 月柱
  day: string    // 日柱
}

/**
 * 黄历数据接口
 * Chinese almanac data
 */
export interface AlmanacData {
  date: Date
  lunarDate: LunarDate
  ganZhi: GanZhi
  suitable: string[]   // 宜
  avoid: string[]      // 忌
  luckyHours: string[] // 吉时
  fiveElements: string // 五行
  clash: string        // 冲煞
}

// ============================================
// 组件 Props 类型 (Component Props Types)
// ============================================

/**
 * WeatherBackground 组件 Props
 */
export interface WeatherBackgroundProps {
  weatherType: WeatherType
  isLoading: boolean
}

/**
 * CalendarView 组件 Props
 */
export interface CalendarViewProps {
  currentDate: Date
  selectedDate: Date
}

/**
 * CalendarCell 组件 Props
 */
export interface CalendarCellProps {
  date: Date
  lunarDate: LunarDate
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  festival?: string
}

/**
 * AlmanacDrawer 组件 Props
 */
export interface AlmanacDrawerProps {
  isOpen: boolean
  selectedDate: Date
}

/**
 * ParticleCanvas 组件 Props
 */
export interface ParticleCanvasProps {
  particleType: ParticleType
  intensity: number
}

// ============================================
// 组合式函数返回类型 (Composable Return Types)
// ============================================

import type { Ref, ComputedRef } from 'vue'

/**
 * useCalendar 返回类型
 */
export interface UseCalendarReturn {
  currentMonth: Ref<Date>
  selectedDate: Ref<Date>
  calendarDays: ComputedRef<CalendarDay[]>
  selectDate: (date: Date) => void
  nextMonth: () => void
  prevMonth: () => void
}

/**
 * useWeather 返回类型
 */
export interface UseWeatherReturn {
  weatherData: Ref<WeatherData | null>
  weatherType: ComputedRef<WeatherType>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  refreshWeather: () => Promise<void>
}

/**
 * useAlmanac 返回类型
 */
export interface UseAlmanacReturn {
  almanacData: ComputedRef<AlmanacData | null>
  isDrawerOpen: Ref<boolean>
  openDrawer: () => void
  closeDrawer: () => void
}

/**
 * useParticles 返回类型
 */
export interface UseParticlesReturn {
  particles: Ref<Particle[]>
  startAnimation: () => void
  stopAnimation: () => void
}
