/**
 * useWeather 组合式函数测试
 * Tests for the useWeather composable
 * 
 * 需求: 3.1, 3.2, 3.6
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useWeather } from './useWeather'
import * as weatherService from '../services/weatherService'
import type { WeatherData } from '../types'

// Mock the weather service
vi.mock('../services/weatherService', () => ({
  getUserLocation: vi.fn(),
  fetchWeatherData: vi.fn(),
  mapWeatherCodeToType: vi.fn(),
  getDefaultLocation: vi.fn()
}))

// Mock Vue's onMounted to execute immediately for testing
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: (fn: () => void) => fn()
  }
})

describe('useWeather', () => {
  const mockWeatherData: WeatherData = {
    location: '北京',
    temperature: 25,
    weatherCode: 0,
    weatherDesc: '晴朗',
    humidity: 50,
    windSpeed: 10,
    updateTime: new Date()
  }

  const mockLocation = {
    latitude: 39.9042,
    longitude: 116.4074
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(weatherService.getDefaultLocation as Mock).mockReturnValue(mockLocation)
    ;(weatherService.mapWeatherCodeToType as Mock).mockReturnValue('sunny')
  })

  describe('initialization', () => {
    it('should initialize with null weatherData before fetch', () => {
      // Don't resolve the promise to test initial state
      ;(weatherService.getUserLocation as Mock).mockReturnValue(new Promise(() => {}))
      ;(weatherService.fetchWeatherData as Mock).mockReturnValue(new Promise(() => {}))

      const { weatherData } = useWeather()
      
      // Before the async operation completes, weatherData should be null
      expect(weatherData.value).toBeNull()
    })

    it('should have weatherData after fetch completes', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      const { weatherData } = useWeather()
      
      await flushPromises()
      
      expect(weatherData.value).toEqual(mockWeatherData)
    })

    it('should initialize with isLoading true during fetch', () => {
      ;(weatherService.getUserLocation as Mock).mockReturnValue(new Promise(() => {}))
      ;(weatherService.fetchWeatherData as Mock).mockReturnValue(new Promise(() => {}))

      const { isLoading } = useWeather()
      
      expect(isLoading.value).toBe(true)
    })

    it('should have isLoading false after fetch completes', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      const { isLoading } = useWeather()
      
      await flushPromises()
      
      expect(isLoading.value).toBe(false)
    })

    it('should initialize with null error', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      const { error } = useWeather()
      
      await flushPromises()
      
      expect(error.value).toBeNull()
    })
  })

  describe('weatherType computed', () => {
    it('should return "default" when weatherData is null', async () => {
      ;(weatherService.getUserLocation as Mock).mockRejectedValue(new Error('Location error'))
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValue(new Error('Fetch error'))

      const { weatherType } = useWeather()
      
      await flushPromises()
      
      expect(weatherType.value).toBe('default')
    })

    it('should return mapped weather type when weatherData exists', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)
      ;(weatherService.mapWeatherCodeToType as Mock).mockReturnValue('sunny')

      const { weatherType } = useWeather()
      
      await flushPromises()
      
      expect(weatherType.value).toBe('sunny')
      expect(weatherService.mapWeatherCodeToType).toHaveBeenCalledWith(mockWeatherData.weatherCode)
    })

    it('should return "rainy" for rainy weather code', async () => {
      const rainyWeatherData = { ...mockWeatherData, weatherCode: 61 }
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(rainyWeatherData)
      ;(weatherService.mapWeatherCodeToType as Mock).mockReturnValue('rainy')

      const { weatherType } = useWeather()
      
      await flushPromises()
      
      expect(weatherType.value).toBe('rainy')
    })

    it('should return "snowy" for snowy weather code', async () => {
      const snowyWeatherData = { ...mockWeatherData, weatherCode: 71 }
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(snowyWeatherData)
      ;(weatherService.mapWeatherCodeToType as Mock).mockReturnValue('snowy')

      const { weatherType } = useWeather()
      
      await flushPromises()
      
      expect(weatherType.value).toBe('snowy')
    })
  })

  describe('refreshWeather', () => {
    it('should set isLoading to true during fetch', async () => {
      let resolvePromise: (value: WeatherData) => void
      const pendingPromise = new Promise<WeatherData>((resolve) => {
        resolvePromise = resolve
      })
      
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockReturnValue(pendingPromise)

      const { isLoading, refreshWeather } = useWeather()
      
      // Start a new refresh
      const refreshPromise = refreshWeather()
      
      // isLoading should be true while fetching
      expect(isLoading.value).toBe(true)
      
      // Resolve the promise
      resolvePromise!(mockWeatherData)
      await refreshPromise
      
      // isLoading should be false after fetch completes
      expect(isLoading.value).toBe(false)
    })

    it('should fetch weather data with user location', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      const { weatherData, refreshWeather } = useWeather()
      
      await refreshWeather()
      
      expect(weatherService.getUserLocation).toHaveBeenCalled()
      expect(weatherService.fetchWeatherData).toHaveBeenCalledWith(
        mockLocation.latitude,
        mockLocation.longitude
      )
      expect(weatherData.value).toEqual(mockWeatherData)
    })

    it('should use default location when getUserLocation fails', async () => {
      ;(weatherService.getUserLocation as Mock).mockRejectedValue(new Error('Permission denied'))
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      const { weatherData, refreshWeather } = useWeather()
      
      await refreshWeather()
      
      expect(weatherService.getDefaultLocation).toHaveBeenCalled()
      expect(weatherService.fetchWeatherData).toHaveBeenCalledWith(
        mockLocation.latitude,
        mockLocation.longitude
      )
      expect(weatherData.value).toEqual(mockWeatherData)
    })

    it('should set error when fetchWeatherData fails', async () => {
      const errorMessage = '获取天气数据失败: Network error'
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValue(new Error(errorMessage))

      const { error, weatherData, refreshWeather } = useWeather()
      
      await refreshWeather()
      
      expect(error.value).toBe(errorMessage)
      expect(weatherData.value).toBeNull()
    })

    it('should clear previous error on successful refresh', async () => {
      // First call fails
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValueOnce(new Error('获取天气数据失败: Network error'))

      const { error, refreshWeather } = useWeather()
      
      await refreshWeather()
      expect(error.value).toBe('获取天气数据失败: Network error')
      
      // Second call succeeds
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValueOnce(mockWeatherData)
      
      await refreshWeather()
      expect(error.value).toBeNull()
    })

    it('should set isLoading to false even when fetch fails', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValue(new Error('Network error'))

      const { isLoading, refreshWeather } = useWeather()
      
      await refreshWeather()
      
      expect(isLoading.value).toBe(false)
    })
  })

  describe('auto-fetch on mount', () => {
    it('should automatically fetch weather data on mount', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      useWeather()
      
      await flushPromises()
      
      expect(weatherService.getUserLocation).toHaveBeenCalled()
      expect(weatherService.fetchWeatherData).toHaveBeenCalled()
    })
  })

  describe('error handling - Requirement 3.6', () => {
    it('should use default weather type when location permission is denied and fetch fails', async () => {
      ;(weatherService.getUserLocation as Mock).mockRejectedValue(new Error('用户拒绝了位置权限请求'))
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValue(new Error('Fetch failed'))

      const { weatherType, error } = useWeather()
      
      await flushPromises()
      
      // Should fall back to default weather type
      expect(weatherType.value).toBe('default')
      expect(error.value).toBeTruthy()
    })

    it('should use default weather type when weather API fails', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValue(new Error('API unavailable'))

      const { weatherType, error } = useWeather()
      
      await flushPromises()
      
      expect(weatherType.value).toBe('default')
      expect(error.value).toBe('API unavailable')
    })

    it('should handle non-Error exceptions gracefully', async () => {
      ;(weatherService.getUserLocation as Mock).mockResolvedValue(mockLocation)
      ;(weatherService.fetchWeatherData as Mock).mockRejectedValue('String error')

      const { error, refreshWeather } = useWeather()
      
      await refreshWeather()
      
      expect(error.value).toBe('获取天气数据失败')
    })

    it('should still fetch weather with default location when location permission denied', async () => {
      ;(weatherService.getUserLocation as Mock).mockRejectedValue(new Error('Permission denied'))
      ;(weatherService.fetchWeatherData as Mock).mockResolvedValue(mockWeatherData)

      const { weatherData, weatherType } = useWeather()
      
      await flushPromises()
      
      // Should successfully fetch weather using default location
      expect(weatherData.value).toEqual(mockWeatherData)
      expect(weatherType.value).toBe('sunny')
      expect(weatherService.getDefaultLocation).toHaveBeenCalled()
    })
  })
})
