/**
 * 天气服务
 * Weather Service
 * 
 * 实现获取用户位置、调用天气 API、天气代码映射
 * Implements user location, weather API calls, and weather code mapping
 * 
 * 使用 Open-Meteo API (https://api.open-meteo.com)
 * Uses Open-Meteo API - free, no API key required
 */

import type { WeatherData, WeatherType } from '../types'

// ============================================
// 常量定义 (Constants)
// ============================================

/** Open-Meteo API 基础 URL */
const OPEN_METEO_API_URL = 'https://api.open-meteo.com/v1/forecast'

/** Open-Meteo 历史天气 API URL */
const OPEN_METEO_HISTORY_URL = 'https://archive-api.open-meteo.com/v1/archive'

/** 默认位置（北京）- 当无法获取用户位置时使用 */
const DEFAULT_LOCATION = {
  latitude: 39.9042,
  longitude: 116.4074,
  name: '北京'
}

/** 位置名称缓存 */
let cachedLocationName: string | null = null
let cachedLocationKey: string | null = null

/**
 * 中国及周边主要城市坐标表（离线匹配用）
 * [纬度, 经度, 城市名]
 */
const CITY_COORDS: [number, number, string][] = [
  // 直辖市
  [39.90, 116.41, '北京'],
  [31.23, 121.47, '上海'],
  [30.57, 104.07, '成都'],
  [29.56, 106.55, '重庆'],
  [39.13, 117.20, '天津'],
  // 省会 / 主要城市
  [23.13, 113.26, '广州'],
  [22.54, 114.06, '深圳'],
  [30.59, 114.31, '武汉'],
  [28.23, 112.94, '长沙'],
  [32.06, 118.80, '南京'],
  [30.27, 120.15, '杭州'],
  [36.07, 120.38, '青岛'],
  [36.67, 116.98, '济南'],
  [34.76, 113.65, '郑州'],
  [38.05, 114.49, '石家庄'],
  [41.80, 123.43, '沈阳'],
  [43.88, 125.32, '长春'],
  [45.75, 126.65, '哈尔滨'],
  [25.04, 102.71, '昆明'],
  [26.65, 106.63, '贵阳'],
  [22.82, 108.32, '南宁'],
  [20.02, 110.35, '海口'],
  [34.26, 108.94, '西安'],
  [36.06, 103.83, '兰州'],
  [38.49, 106.23, '银川'],
  [36.62, 101.77, '西宁'],
  [43.83, 87.62, '乌鲁木齐'],
  [29.65, 91.13, '拉萨'],
  [40.84, 111.75, '呼和浩特'],
  [26.08, 119.30, '福州'],
  [24.48, 118.09, '厦门'],
  [28.68, 115.86, '南昌'],
  [31.86, 117.28, '合肥'],
  [37.87, 112.55, '太原'],
  [43.17, 126.58, '吉林'],
  [21.27, 110.35, '湛江'],
  [24.33, 109.42, '桂林'],
  [18.25, 109.50, '三亚'],
  // 港澳台
  [22.32, 114.17, '香港'],
  [22.20, 113.55, '澳门'],
  [25.03, 121.57, '台北'],
  [22.62, 120.31, '高雄'],
  // 国际主要城市
  [35.68, 139.69, '东京'],
  [37.57, 126.98, '首尔'],
  [1.35, 103.82, '新加坡'],
  [13.76, 100.50, '曼谷'],
  [35.69, 51.39, '德黑兰'],
  [55.76, 37.62, '莫斯科'],
  [51.51, -0.13, '伦敦'],
  [48.86, 2.35, '巴黎'],
  [52.52, 13.41, '柏林'],
  [40.71, -74.01, '纽约'],
  [34.05, -118.24, '洛杉矶'],
  [-33.87, 151.21, '悉尼'],
]

/**
 * WMO 天气代码到天气描述的映射
 * WMO Weather Code to description mapping
 * https://open-meteo.com/en/docs#weathervariables
 */
const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: '晴朗',
  1: '大部晴朗',
  2: '局部多云',
  3: '多云',
  45: '雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '中毛毛雨',
  55: '大毛毛雨',
  56: '冻毛毛雨',
  57: '强冻毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '小冻雨',
  67: '大冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '小阵雨',
  81: '中阵雨',
  82: '大阵雨',
  85: '小阵雪',
  86: '大阵雪',
  95: '雷暴',
  96: '雷暴伴小冰雹',
  99: '雷暴伴大冰雹'
}

// ============================================
// 类型定义 (Type Definitions)
// ============================================

/** 用户位置接口 */
export interface UserLocation {
  latitude: number
  longitude: number
}

/** Open-Meteo API 响应接口 */
interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
  }
}

/** Open-Meteo Daily API 响应接口 */
interface OpenMeteoDailyResponse {
  latitude: number
  longitude: number
  timezone: string
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    relative_humidity_2m_mean?: number[]
    wind_speed_10m_max?: number[]
  }
}

// ============================================
// 主要导出函数 (Main Export Functions)
// ============================================

/**
 * 获取用户位置
 * Get user's geolocation using browser Geolocation API
 * 
 * @returns Promise<UserLocation> 用户位置（经纬度）
 * @throws Error 当位置权限被拒绝或获取失败时
 * 
 * 验证: 需求 3.1 - 请求用户位置权限并获取当地天气数据
 */
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    // 检查浏览器是否支持 Geolocation API
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置功能'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let errorMessage: string
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了位置权限请求'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMessage = '获取位置超时'
            break
          default:
            errorMessage = '获取位置时发生未知错误'
        }
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5分钟缓存
      }
    )
  })
}

/**
 * 获取天气数据（支持指定日期）
 * Fetch weather data from Open-Meteo API, supports specific date
 * 
 * @param lat 纬度
 * @param lon 经度
 * @param date 可选，指定日期。不传则获取当前天气
 * @returns Promise<WeatherData> 天气数据
 * @throws Error 当 API 请求失败时
 * 
 * 验证: 需求 3.1, 3.2 - 获取当地天气数据并根据天气类型渲染背景
 */
export async function fetchWeatherData(lat: number, lon: number, date?: Date): Promise<WeatherData> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = date ? new Date(date) : null
  if (targetDate) targetDate.setHours(0, 0, 0, 0)

  // 判断是否需要按日期查询（非今天的日期）
  const isTargetToday = !targetDate || targetDate.getTime() === today.getTime()

  if (isTargetToday) {
    // 获取当前天气
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      timezone: 'auto'
    })

    const url = `${OPEN_METEO_API_URL}?${params.toString()}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`天气 API 请求失败: ${response.status} ${response.statusText}`)
      }
      const data: OpenMeteoResponse = await response.json()
      const locationName = await getLocationName(lat, lon)

      return {
        location: locationName,
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        weatherDesc: getWeatherDescription(data.current.weather_code),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        updateTime: new Date(data.current.time)
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取天气数据失败: ${error.message}`)
      }
      throw new Error('获取天气数据时发生未知错误')
    }
  } else {
    // 按日期查询：使用 daily 参数获取指定日期的天气
    const dateStr = formatDateParam(targetDate!)
    const diffDays = Math.round((targetDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Open-Meteo forecast API 支持未来 16 天，历史 API 用于过去日期
    const isFuture = diffDays > 0
    const isPast = diffDays < 0
    
    let apiUrl: string
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_mean,wind_speed_10m_max',
      timezone: 'auto',
      start_date: dateStr,
      end_date: dateStr
    })

    if (isPast) {
      // 过去的日期使用历史 API
      apiUrl = `${OPEN_METEO_HISTORY_URL}?${params.toString()}`
    } else if (isFuture && diffDays <= 16) {
      // 未来 16 天内使用预报 API
      apiUrl = `${OPEN_METEO_API_URL}?${params.toString()}`
    } else {
      // 超出范围，使用气候 API 或返回默认
      apiUrl = `${OPEN_METEO_API_URL}?${params.toString()}`
    }

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`天气 API 请求失败: ${response.status} ${response.statusText}`)
      }
      const data: OpenMeteoDailyResponse = await response.json()
      const locationName = await getLocationName(lat, lon)

      const avgTemp = Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2)

      return {
        location: locationName,
        temperature: avgTemp,
        weatherCode: data.daily.weather_code[0],
        weatherDesc: getWeatherDescription(data.daily.weather_code[0]),
        humidity: data.daily.relative_humidity_2m_mean?.[0] ?? 0,
        windSpeed: data.daily.wind_speed_10m_max?.[0] ?? 0,
        updateTime: targetDate!
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`获取天气数据失败: ${error.message}`)
      }
      throw new Error('获取天气数据时发生未知错误')
    }
  }
}

/**
 * 天气代码到天气类型的映射
 * Map WMO weather code to WeatherType
 * 
 * @param code WMO 天气代码
 * @returns WeatherType 天气类型
 * 
 * 验证: 需求 3.2 - 根据天气类型（晴、阴、雨、雪等）渲染对应的背景效果
 * 
 * WMO Weather Codes:
 * 0: Clear sky
 * 1-3: Mainly clear, partly cloudy, overcast
 * 45-48: Fog
 * 51-57: Drizzle
 * 61-67: Rain
 * 71-77: Snow
 * 80-82: Rain showers
 * 85-86: Snow showers
 * 95-99: Thunderstorm
 */
export function mapWeatherCodeToType(code: number): WeatherType {
  // 晴天: 0 (晴朗), 1 (大部晴朗)
  if (code === 0 || code === 1) {
    return 'sunny'
  }

  // 多云: 2 (局部多云), 3 (多云)
  if (code === 2 || code === 3) {
    return 'cloudy'
  }

  // 雾天: 45 (雾), 48 (雾凇)
  if (code === 45 || code === 48) {
    return 'foggy'
  }

  // 雨天: 51-67 (毛毛雨、雨、冻雨), 80-82 (阵雨), 95-99 (雷暴)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
    return 'rainy'
  }

  // 雪天: 71-77 (雪、雪粒), 85-86 (阵雪)
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return 'snowy'
  }

  // 默认
  return 'default'
}

// ============================================
// 辅助函数 (Helper Functions)
// ============================================

/**
 * 格式化日期为 API 参数格式 (YYYY-MM-DD)
 */
function formatDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 获取天气描述
 * Get weather description from weather code
 * 
 * @param code WMO 天气代码
 * @returns 天气描述文字
 */
function getWeatherDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] || '未知天气'
}

/**
 * 获取位置名称（离线坐标匹配）
 * Get location name by matching coordinates to nearest known city
 * 
 * 完全离线，不依赖任何外部 API。
 * 在城市坐标表中找距离最近的城市，阈值 150km 内返回城市名，
 * 超出则显示坐标。
 * 
 * @param lat 纬度
 * @param lon 经度
 * @returns 位置名称
 */
async function getLocationName(lat: number, lon: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`
  if (cachedLocationKey === key && cachedLocationName) {
    return cachedLocationName
  }

  let bestName = ''
  let bestDist = Infinity

  for (const [cLat, cLon, cName] of CITY_COORDS) {
    // 简化距离计算（经纬度差的欧氏距离，1度 ≈ 111km）
    const dLat = lat - cLat
    const dLon = (lon - cLon) * Math.cos((lat * Math.PI) / 180)
    const dist = Math.sqrt(dLat * dLat + dLon * dLon)
    if (dist < bestDist) {
      bestDist = dist
      bestName = cName
    }
  }

  // 阈值：约 1.35 度 ≈ 150km
  if (bestDist < 1.35 && bestName) {
    cachedLocationKey = key
    cachedLocationName = bestName
    return bestName
  }

  return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
}

/**
 * 获取默认位置
 * Get default location when user location is unavailable
 * 
 * @returns 默认位置
 */
export function getDefaultLocation(): UserLocation {
  return {
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude
  }
}

/**
 * 根据天气类型获取天气图标 emoji
 * Get weather icon emoji based on weather type
 * 
 * @param type 天气类型
 * @returns emoji 图标
 */
export function getWeatherIcon(type: WeatherType): string {
  switch (type) {
    case 'sunny':  return '☀️'
    case 'cloudy':  return '☁️'
    case 'rainy':   return '🌧️'
    case 'snowy':   return '❄️'
    case 'foggy':   return '🌫️'
    default:        return '🌤️'
  }
}

/**
 * 获取所有支持的天气代码
 * Get all supported weather codes (for testing)
 * 
 * @returns 支持的天气代码数组
 */
export function getSupportedWeatherCodes(): number[] {
  return Object.keys(WEATHER_CODE_DESCRIPTIONS).map(Number)
}
