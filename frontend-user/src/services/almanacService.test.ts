/**
 * 黄历数据服务测试
 * Almanac Data Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  getSuitableActivities,
  getAvoidActivities,
  getLuckyHours,
  getFiveElements,
  getClash,
  getAlmanacData
} from './almanacService'

describe('AlmanacService', () => {
  // 使用固定日期进行测试
  const testDate = new Date(2024, 0, 15) // 2024年1月15日
  const testDate2 = new Date(2024, 5, 21) // 2024年6月21日（夏至附近）
  const testDate3 = new Date(2024, 11, 25) // 2024年12月25日

  describe('getSuitableActivities', () => {
    it('should return an array of suitable activities', () => {
      const suitable = getSuitableActivities(testDate)
      
      expect(Array.isArray(suitable)).toBe(true)
      expect(suitable.length).toBeGreaterThan(0)
      suitable.forEach(activity => {
        expect(typeof activity).toBe('string')
        expect(activity.length).toBeGreaterThan(0)
      })
    })

    it('should return at least 4 suitable activities', () => {
      const suitable = getSuitableActivities(testDate)
      expect(suitable.length).toBeGreaterThanOrEqual(4)
    })

    it('should return different activities for different dates', () => {
      const suitable1 = getSuitableActivities(testDate)
      const suitable2 = getSuitableActivities(testDate2)
      
      // 不同日期的宜事项应该有所不同
      const set1 = new Set(suitable1)
      const set2 = new Set(suitable2)
      const intersection = [...set1].filter(x => set2.has(x))
      
      // 允许有一些重叠，但不应完全相同
      expect(intersection.length).toBeLessThan(Math.max(suitable1.length, suitable2.length))
    })

    it('should return consistent results for the same date', () => {
      const suitable1 = getSuitableActivities(testDate)
      const suitable2 = getSuitableActivities(testDate)
      
      expect(suitable1).toEqual(suitable2)
    })
  })

  describe('getAvoidActivities', () => {
    it('should return an array of activities to avoid', () => {
      const avoid = getAvoidActivities(testDate)
      
      expect(Array.isArray(avoid)).toBe(true)
      expect(avoid.length).toBeGreaterThan(0)
      avoid.forEach(activity => {
        expect(typeof activity).toBe('string')
        expect(activity.length).toBeGreaterThan(0)
      })
    })

    it('should return at least 3 activities to avoid', () => {
      const avoid = getAvoidActivities(testDate)
      expect(avoid.length).toBeGreaterThanOrEqual(3)
    })

    it('should not have overlap with suitable activities', () => {
      const suitable = getSuitableActivities(testDate)
      const avoid = getAvoidActivities(testDate)
      
      const suitableSet = new Set(suitable)
      avoid.forEach(activity => {
        expect(suitableSet.has(activity)).toBe(false)
      })
    })
  })

  describe('getLuckyHours', () => {
    it('should return an array of lucky hours', () => {
      const luckyHours = getLuckyHours(testDate)
      
      expect(Array.isArray(luckyHours)).toBe(true)
      expect(luckyHours.length).toBeGreaterThan(0)
    })

    it('should return 6 lucky hours (六吉时)', () => {
      const luckyHours = getLuckyHours(testDate)
      expect(luckyHours.length).toBe(6)
    })

    it('should include time range in each lucky hour', () => {
      const luckyHours = getLuckyHours(testDate)
      
      luckyHours.forEach(hour => {
        expect(hour).toMatch(/时/)
        expect(hour).toMatch(/\d{2}:\d{2}-\d{2}:\d{2}/)
      })
    })

    it('should include valid 时辰 names', () => {
      const validShiChen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
      const luckyHours = getLuckyHours(testDate)
      
      luckyHours.forEach(hour => {
        const shiChen = hour.charAt(0)
        expect(validShiChen).toContain(shiChen)
      })
    })
  })

  describe('getFiveElements', () => {
    it('should return a string with five elements', () => {
      const fiveElements = getFiveElements(testDate)
      
      expect(typeof fiveElements).toBe('string')
      expect(fiveElements.length).toBe(2) // 两个五行元素
    })

    it('should contain valid five element characters', () => {
      const validElements = ['金', '木', '水', '火', '土']
      const fiveElements = getFiveElements(testDate)
      
      expect(validElements).toContain(fiveElements.charAt(0))
      expect(validElements).toContain(fiveElements.charAt(1))
    })

    it('should return consistent results for the same date', () => {
      const elements1 = getFiveElements(testDate)
      const elements2 = getFiveElements(testDate)
      
      expect(elements1).toBe(elements2)
    })
  })

  describe('getClash', () => {
    it('should return clash information', () => {
      const clash = getClash(testDate)
      
      expect(typeof clash).toBe('string')
      expect(clash.length).toBeGreaterThan(0)
    })

    it('should include 冲 and 煞 information', () => {
      const clash = getClash(testDate)
      
      expect(clash).toMatch(/冲/)
      expect(clash).toMatch(/煞/)
    })

    it('should include valid zodiac animal', () => {
      const validZodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
      const clash = getClash(testDate)
      
      const hasValidZodiac = validZodiac.some(zodiac => clash.includes(zodiac))
      expect(hasValidZodiac).toBe(true)
    })

    it('should include valid direction', () => {
      const validDirections = ['东', '南', '西', '北']
      const clash = getClash(testDate)
      
      const hasValidDirection = validDirections.some(dir => clash.includes(dir))
      expect(hasValidDirection).toBe(true)
    })
  })

  describe('getAlmanacData', () => {
    it('should return complete almanac data', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(almanacData).toBeDefined()
      expect(almanacData.date).toEqual(testDate)
    })

    it('should include lunar date', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(almanacData.lunarDate).toBeDefined()
      expect(almanacData.lunarDate.year).toBeGreaterThan(0)
      expect(almanacData.lunarDate.month).toBeGreaterThanOrEqual(1)
      expect(almanacData.lunarDate.month).toBeLessThanOrEqual(12)
      expect(almanacData.lunarDate.day).toBeGreaterThanOrEqual(1)
      expect(almanacData.lunarDate.day).toBeLessThanOrEqual(30)
    })

    it('should include ganZhi (天干地支)', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(almanacData.ganZhi).toBeDefined()
      expect(almanacData.ganZhi.year).toHaveLength(2)
      expect(almanacData.ganZhi.month).toHaveLength(2)
      expect(almanacData.ganZhi.day).toHaveLength(2)
    })

    it('should include suitable activities', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(Array.isArray(almanacData.suitable)).toBe(true)
      expect(almanacData.suitable.length).toBeGreaterThanOrEqual(4)
    })

    it('should include avoid activities', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(Array.isArray(almanacData.avoid)).toBe(true)
      expect(almanacData.avoid.length).toBeGreaterThanOrEqual(3)
    })

    it('should include lucky hours', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(Array.isArray(almanacData.luckyHours)).toBe(true)
      expect(almanacData.luckyHours.length).toBe(6)
    })

    it('should include five elements', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(typeof almanacData.fiveElements).toBe('string')
      expect(almanacData.fiveElements.length).toBe(2)
    })

    it('should include clash information', () => {
      const almanacData = getAlmanacData(testDate)
      
      expect(typeof almanacData.clash).toBe('string')
      expect(almanacData.clash).toMatch(/冲/)
      expect(almanacData.clash).toMatch(/煞/)
    })

    it('should have no overlap between suitable and avoid activities', () => {
      const almanacData = getAlmanacData(testDate)
      
      const suitableSet = new Set(almanacData.suitable)
      almanacData.avoid.forEach(activity => {
        expect(suitableSet.has(activity)).toBe(false)
      })
    })
  })

  describe('Different dates produce different results', () => {
    it('should produce different almanac data for different dates', () => {
      const data1 = getAlmanacData(testDate)
      const data2 = getAlmanacData(testDate2)
      const data3 = getAlmanacData(testDate3)
      
      // 不同日期的干支应该不同
      expect(data1.ganZhi.day).not.toBe(data2.ganZhi.day)
      expect(data2.ganZhi.day).not.toBe(data3.ganZhi.day)
    })

    it('should produce consistent results for the same date', () => {
      const data1 = getAlmanacData(testDate)
      const data2 = getAlmanacData(new Date(testDate.getTime()))
      
      expect(data1.ganZhi).toEqual(data2.ganZhi)
      expect(data1.suitable).toEqual(data2.suitable)
      expect(data1.avoid).toEqual(data2.avoid)
      expect(data1.luckyHours).toEqual(data2.luckyHours)
      expect(data1.fiveElements).toBe(data2.fiveElements)
      expect(data1.clash).toBe(data2.clash)
    })
  })
})
