/**
 * 天气服务测试
 * Weather Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getUserLocation,
  fetchWeatherData,
  mapWeatherCodeToType,
  getDefaultLocation,
  getSupportedWeatherCodes
} from './weatherService'
import type { WeatherType } from '../types'

describe('weatherService', () => {
  describe('mapWeatherCodeToType', () => {
    it('should map code 0 (clear sky) to sunny', () => {
      expect(mapWeatherCodeToType(0)).toBe('sunny')
    })

    it('should map code 1 (mainly clear) to sunny', () => {
      expect(mapWeatherCodeToType(1)).toBe('sunny')
    })

    it('should map code 2 (partly cloudy) to cloudy', () => {
      expect(mapWeatherCodeToType(2)).toBe('cloudy')
    })

    it('should map code 3 (overcast) to cloudy', () => {
      expect(mapWeatherCodeToType(3)).toBe('cloudy')
    })

    it('should map code 45 (fog) to foggy', () => {
      expect(mapWeatherCodeToType(45)).toBe('foggy')
    })

    it('should map code 48 (depositing rime fog) to foggy', () => {
      expect(mapWeatherCodeToType(48)).toBe('foggy')
    })

    it('should map drizzle codes (51-57) to rainy', () => {
      const drizzleCodes = [51, 53, 55, 56, 57]
      drizzleCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('rainy')
      })
    })

    it('should map rain codes (61-67) to rainy', () => {
      const rainCodes = [61, 63, 65, 66, 67]
      rainCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('rainy')
      })
    })

    it('should map rain shower codes (80-82) to rainy', () => {
      const showerCodes = [80, 81, 82]
      showerCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('rainy')
      })
    })

    it('should map thunderstorm codes (95-99) to rainy', () => {
      const thunderCodes = [95, 96, 99]
      thunderCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('rainy')
      })
    })

    it('should map snow codes (71-77) to snowy', () => {
      const snowCodes = [71, 73, 75, 77]
      snowCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('snowy')
      })
    })

    it('should map snow shower codes (85-86) to snowy', () => {
      const snowShowerCodes = [85, 86]
      snowShowerCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('snowy')
      })
    })

    it('should map unknown codes to default', () => {
      const unknownCodes = [100, 200, -1, 999]
      unknownCodes.forEach(code => {
        expect(mapWeatherCodeToType(code)).toBe('default')
      })
    })

    it('should return valid WeatherType for all supported codes', () => {
      const validTypes: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'default']
      const supportedCodes = getSupportedWeatherCodes()
      
      supportedCodes.forEach(code => {
        const result = mapWeatherCodeToType(code)
        expect(validTypes).toContain(result)
      })
    })
  })

  describe('getDefaultLocation', () => {
    it('should return Beijing coordinates', () => {
      const location = getDefaultLocation()
      
      expect(location.latitude).toBeCloseTo(39.9042, 2)
      expect(location.longitude).toBeCloseTo(116.4074, 2)
    })

    it('should return valid latitude and longitude', () => {
      const location = getDefaultLocation()
      
      expect(location.latitude).toBeGreaterThanOrEqual(-90)
      expect(location.latitude).toBeLessThanOrEqual(90)
      expect(location.longitude).toBeGreaterThanOrEqual(-180)
      expect(location.longitude).toBeLessThanOrEqual(180)
    })
  })

  describe('getSupportedWeatherCodes', () => {
    it('should return an array of numbers', () => {
      const codes = getSupportedWeatherCodes()
      
      expect(Array.isArray(codes)).toBe(true)
      codes.forEach(code => {
        expect(typeof code).toBe('number')
      })
    })

    it('should include common weather codes', () => {
      const codes = getSupportedWeatherCodes()
      
      // 晴天
      expect(codes).toContain(0)
      // 多云
      expect(codes).toContain(3)
      // 雨
      expect(codes).toContain(61)
      // 雪
      expect(codes).toContain(71)
      // 雾
      expect(codes).toContain(45)
    })
  })

  describe('getUserLocation', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn()
    }

    beforeEach(() => {
      // Mock navigator.geolocation
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should resolve with coordinates when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: 31.2304,
          longitude: 121.4737
        }
      }

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const location = await getUserLocation()

      expect(location.latitude).toBe(31.2304)
      expect(location.longitude).toBe(121.4737)
    })

    it('should reject with error when permission denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      }

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError)
      })

      await expect(getUserLocation()).rejects.toThrow('用户拒绝了位置权限请求')
    })

    it('should reject with error when position unavailable', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      }

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError)
      })

      await expect(getUserLocation()).rejects.toThrow('位置信息不可用')
    })

    it('should reject with error when timeout', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      }

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError)
      })

      await expect(getUserLocation()).rejects.toThrow('获取位置超时')
    })

    it('should reject when geolocation not supported', async () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true
      })

      await expect(getUserLocation()).rejects.toThrow('浏览器不支持地理位置功能')
    })
  })

  describe('fetchWeatherData', () => {
    const mockFetch = vi.fn()

    beforeEach(() => {
      global.fetch = mockFetch
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should fetch and parse weather data correctly', async () => {
      const mockResponse = {
        latitude: 39.9,
        longitude: 116.4,
        timezone: 'Asia/Shanghai',
        current: {
          time: '2024-01-15T12:00',
          temperature_2m: 5.5,
          relative_humidity_2m: 45,
          weather_code: 0,
          wind_speed_10m: 12.5
        }
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const data = await fetchWeatherData(39.9042, 116.4074)

      expect(data.temperature).toBe(6) // Rounded
      expect(data.humidity).toBe(45)
      expect(data.weatherCode).toBe(0)
      expect(data.windSpeed).toBe(12.5)
      expect(data.weatherDesc).toBe('晴朗')
      expect(data.updateTime).toBeInstanceOf(Date)
    })

    it('should throw error when API returns non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(fetchWeatherData(39.9, 116.4)).rejects.toThrow('天气 API 请求失败')
    })

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(fetchWeatherData(39.9, 116.4)).rejects.toThrow('获取天气数据失败')
    })

    it('should call API with correct parameters', async () => {
      const mockResponse = {
        latitude: 31.23,
        longitude: 121.47,
        timezone: 'Asia/Shanghai',
        current: {
          time: '2024-01-15T12:00',
          temperature_2m: 10,
          relative_humidity_2m: 60,
          weather_code: 3,
          wind_speed_10m: 8
        }
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await fetchWeatherData(31.2304, 121.4737)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('api.open-meteo.com')
      expect(calledUrl).toContain('latitude=31.2304')
      expect(calledUrl).toContain('longitude=121.4737')
      expect(calledUrl).toContain('temperature_2m')
      expect(calledUrl).toContain('weather_code')
    })
  })
})
