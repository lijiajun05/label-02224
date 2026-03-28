/**
 * 农历转换服务
 * Lunar Calendar Conversion Service
 * 
 * 实现公历转农历、天干地支、节气和传统节日判断
 * Implements solar-to-lunar conversion, Gan-Zhi calculation, solar terms and festivals
 */

import type { LunarDate, GanZhi } from '../types'

// ============================================
// 常量定义 (Constants)
// ============================================

/** 天干 Heavenly Stems */
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/** 地支 Earthly Branches */
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 生肖 Chinese Zodiac */
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

/** 农历月份名称 Lunar month names */
const LUNAR_MONTH_CN = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

/** 农历日期名称 Lunar day names */
const LUNAR_DAY_CN = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

/** 24节气名称 Solar terms */
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
]

/**
 * 农历数据表 (1900-2100)
 * 每个数字的含义：
 * - 低12位：每月大小月信息（1为大月30天，0为小月29天）
 * - 第13-16位：闰月月份（0表示无闰月）
 * - 第17-20位：闰月大小（1为大月30天，0为小月29天）
 */
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520  // 2100
]

/**
 * 节气数据表 (1900-2100)
 * 每年24个节气的日期偏移量
 */
const SOLAR_TERM_INFO = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551,
  218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447,
  419210, 440795, 462224, 483532, 504758
]

// ============================================
// 农历节日 (Lunar Festivals)
// ============================================

/** 农历节日映射 (月-日 -> 节日名称) */
const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '5-5': '端午节',
  '7-7': '七夕节',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-30': '除夕'
}

/** 公历节日映射 (月-日 -> 节日名称) */
const SOLAR_FESTIVALS: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-25': '圣诞节'
}

// ============================================
// 辅助函数 (Helper Functions)
// ============================================

/**
 * 获取农历年的总天数
 * @param year 农历年份
 */
function getLunarYearDays(year: number): number {
  let sum = 348
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0
  }
  return sum + getLeapMonthDays(year)
}

/**
 * 获取农历年闰月的天数
 * @param year 农历年份
 */
function getLeapMonthDays(year: number): number {
  if (getLeapMonth(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29
  }
  return 0
}

/**
 * 获取农历年闰月月份
 * @param year 农历年份
 * @returns 闰月月份，0表示无闰月
 */
function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - 1900] & 0xf
}

/**
 * 获取农历年某月的天数
 * @param year 农历年份
 * @param month 农历月份
 */
function getLunarMonthDays(year: number, month: number): number {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29
}

// ============================================
// 主要导出函数 (Main Export Functions)
// ============================================

/**
 * 公历转农历
 * Convert solar date to lunar date
 * 
 * @param date 公历日期
 * @returns 农历日期对象
 */
export function solarToLunar(date: Date): LunarDate {
  // 基准日期：1900年1月31日是农历1900年正月初一
  const baseDate = new Date(1900, 0, 31)
  let offset = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)
  
  // 计算农历年
  let lunarYear = 1900
  let daysInYear = 0
  
  for (let i = 1900; i < 2101 && offset > 0; i++) {
    daysInYear = getLunarYearDays(i)
    offset -= daysInYear
    lunarYear++
  }
  
  if (offset < 0) {
    offset += daysInYear
    lunarYear--
  }
  
  // 计算农历月和日
  const leapMonth = getLeapMonth(lunarYear)
  let isLeapMonth = false
  let lunarMonth = 1
  let daysInMonth = 0
  
  for (let i = 1; i < 13 && offset > 0; i++) {
    // 闰月
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeapMonth) {
      --i
      isLeapMonth = true
      daysInMonth = getLeapMonthDays(lunarYear)
    } else {
      daysInMonth = getLunarMonthDays(lunarYear, i)
    }
    
    // 解除闰月
    if (isLeapMonth && i === leapMonth + 1) {
      isLeapMonth = false
    }
    
    offset -= daysInMonth
    if (!isLeapMonth) {
      lunarMonth++
    }
  }
  
  if (offset < 0) {
    offset += daysInMonth
    lunarMonth--
  }
  
  // 处理闰月情况
  if (leapMonth > 0 && lunarMonth === leapMonth + 1) {
    if (isLeapMonth) {
      isLeapMonth = true
    } else if (offset < getLunarMonthDays(lunarYear, lunarMonth)) {
      isLeapMonth = false
    }
  }
  
  const lunarDay = offset + 1
  
  // 生成中文表示
  const ganZhi = getGanZhi(date)
  const yearCn = ganZhi.year + '年'
  const monthCn = (isLeapMonth ? '闰' : '') + LUNAR_MONTH_CN[lunarMonth - 1] + '月'
  const dayCn = LUNAR_DAY_CN[lunarDay - 1]
  
  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    yearCn,
    monthCn,
    dayCn,
    isLeapMonth
  }
}

/**
 * 获取天干地支
 * Get Heavenly Stems and Earthly Branches for a date
 * 
 * @param date 公历日期
 * @returns 天干地支对象
 */
export function getGanZhi(date: Date): GanZhi {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  
  // 年柱计算（以立春为界）
  // 简化处理：使用公历年份计算
  let yearOffset = year - 4 // 公元4年为甲子年
  // 如果在立春之前，年柱使用上一年
  const lichunDate = getSolarTermDate(year, 2) // 立春是第3个节气（索引2）
  if (date < lichunDate) {
    yearOffset--
  }
  const yearGan = TIAN_GAN[yearOffset % 10]
  const yearZhi = DI_ZHI[yearOffset % 12]
  
  // 月柱计算
  // 月干 = (年干序号 * 2 + 月份) % 10
  // 月支固定：正月寅，二月卯...
  let monthNum = month
  // 以节气为界调整月份
  const jieqiIndex = (month - 1) * 2 // 每月第一个节气的索引
  const jieqiDate = getSolarTermDate(year, jieqiIndex)
  if (date < jieqiDate) {
    monthNum = month === 1 ? 12 : month - 1
  }
  
  const yearGanIndex = (yearOffset % 10 + 10) % 10
  const monthGanIndex = (yearGanIndex * 2 + monthNum) % 10
  const monthZhiIndex = (monthNum + 1) % 12 // 正月为寅(索引2)
  const monthGan = TIAN_GAN[monthGanIndex]
  const monthZhi = DI_ZHI[monthZhiIndex]
  
  // 日柱计算
  // 使用儒略日计算
  const baseDate = new Date(1900, 0, 1) // 1900年1月1日是甲戌日
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)
  const dayGanIndex = (diffDays + 10) % 10 // 1900年1月1日天干为甲(0)，调整偏移
  const dayZhiIndex = (diffDays + 10) % 12 // 1900年1月1日地支为戌(10)，调整偏移
  const dayGan = TIAN_GAN[dayGanIndex]
  const dayZhi = DI_ZHI[dayZhiIndex]
  
  return {
    year: yearGan + yearZhi,
    month: monthGan + monthZhi,
    day: dayGan + dayZhi
  }
}

/**
 * 获取某年某个节气的日期
 * @param year 年份
 * @param termIndex 节气索引 (0-23)
 */
function getSolarTermDate(year: number, termIndex: number): Date {
  const baseTime = new Date(1900, 0, 6, 2, 5, 0).getTime()
  const termTime = baseTime + SOLAR_TERM_INFO[termIndex] * 60000
  const yearOffset = (year - 1900) * 365.2422 * 24 * 60 * 60 * 1000
  const resultTime = termTime + yearOffset
  return new Date(resultTime)
}

/**
 * 获取节气
 * Get solar term if the date is a solar term day
 * 
 * @param date 公历日期
 * @returns 节气名称，如果不是节气日则返回 undefined
 */
export function getSolarTerm(date: Date): string | undefined {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  
  // 每月有两个节气
  const termIndex1 = month * 2
  const termIndex2 = month * 2 + 1
  
  const term1Date = getSolarTermDate(year, termIndex1)
  const term2Date = getSolarTermDate(year, termIndex2)
  
  if (term1Date.getDate() === day && term1Date.getMonth() === month) {
    return SOLAR_TERMS[termIndex1]
  }
  
  if (term2Date.getDate() === day && term2Date.getMonth() === month) {
    return SOLAR_TERMS[termIndex2]
  }
  
  return undefined
}

/**
 * 获取节日
 * Get festival name (both solar and lunar festivals)
 * 
 * @param date 公历日期
 * @param lunarDate 农历日期
 * @returns 节日名称，如果不是节日则返回 undefined
 */
export function getFestival(date: Date, lunarDate: LunarDate): string | undefined {
  const solarMonth = date.getMonth() + 1
  const solarDay = date.getDate()
  const solarKey = `${solarMonth}-${solarDay}`
  
  // 优先返回农历节日
  const lunarKey = `${lunarDate.month}-${lunarDate.day}`
  
  // 特殊处理除夕（可能是29或30）
  if (lunarDate.month === 12) {
    // 检查是否是该年最后一天（除夕）
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextLunar = solarToLunar(nextDay)
    if (nextLunar.month === 1 && nextLunar.day === 1) {
      return '除夕'
    }
  }
  
  if (LUNAR_FESTIVALS[lunarKey]) {
    return LUNAR_FESTIVALS[lunarKey]
  }
  
  if (SOLAR_FESTIVALS[solarKey]) {
    return SOLAR_FESTIVALS[solarKey]
  }
  
  // 检查是否是节气
  return getSolarTerm(date)
}

/**
 * 获取生肖
 * Get Chinese zodiac animal for a lunar year
 * 
 * @param lunarYear 农历年份
 * @returns 生肖名称
 */
export function getZodiac(lunarYear: number): string {
  return SHENG_XIAO[(lunarYear - 4) % 12]
}
