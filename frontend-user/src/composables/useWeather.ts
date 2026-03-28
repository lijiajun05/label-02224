/**
 * useWeather 组合式函数
 * Weather composable for managing weather state and data fetching
 * 
 * 需求: 3.1, 3.2, 3.6
 * - 3.1: 请求用户位置权限并获取当地天气数据
 * - 3.2: 根据天气类型渲染对应的背景效果
 * - 3.6: 位置权限被拒绝或天气数据获取失败时显示默认背景
 */

import { ref, computed, onMounted, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { WeatherData, WeatherType, UseWeatherReturn } from '../types'
import {
  getUserLocation,
  fetchWeatherData,
  mapWeatherCodeToType,
  getDefaultLocation
} from '../services/weatherService'
import type { UserLocation } from '../services/weatherService'

/**
 * 天气组合式函数
 * Composable for weather state management
 * 
 * @param selectedDate - 可选，当前选中的日期 Ref，切换日期时自动刷新天气
 * @returns UseWeatherReturn - 天气状态和操作方法
 */
export function useWeather(selectedDate?: Ref<Date>): UseWeatherReturn {
  // 天气数据
  const weatherData: Ref<WeatherData | null> = ref(null)
  
  // 加载状态
  const isLoading: Ref<boolean> = ref(false)
  
  // 错误信息
  const error: Ref<string | null> = ref(null)

  // 缓存用户位置，避免重复请求
  let userLocation: UserLocation | null = null
  
  /**
   * 计算天气类型
   * Compute weather type from weather data
   * Returns 'default' when no data or on error
   */
  const weatherType: ComputedRef<WeatherType> = computed(() => {
    if (!weatherData.value) {
      return 'default'
    }
    return mapWeatherCodeToType(weatherData.value.weatherCode)
  })

  /**
   * 获取并缓存用户位置
   */
  async function resolveLocation(): Promise<UserLocation> {
    if (userLocation) return userLocation
    try {
      userLocation = await getUserLocation()
    } catch {
      userLocation = getDefaultLocation()
    }
    return userLocation
  }
  
  /**
   * 刷新天气数据
   * Refresh weather data by fetching from API
   * 
   * @param date - 可选，指定日期获取天气
   */
  async function refreshWeather(date?: Date): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const location = await resolveLocation()
      
      // 获取天气数据（传入日期参数）
      const data = await fetchWeatherData(location.latitude, location.longitude, date)
      weatherData.value = data
    } catch (err) {
      // 处理错误
      error.value = err instanceof Error ? err.message : '获取天气数据失败'
      // 保持 weatherData 为 null，weatherType 将返回 'default'
    } finally {
      isLoading.value = false
    }
  }
  
  // 组件挂载时自动获取天气数据
  onMounted(() => {
    refreshWeather(selectedDate?.value)
  })

  // 监听选中日期变化，自动刷新天气
  if (selectedDate) {
    watch(selectedDate, (newDate) => {
      refreshWeather(newDate)
    })
  }
  
  return {
    weatherData,
    weatherType,
    isLoading,
    error,
    refreshWeather
  }
}
