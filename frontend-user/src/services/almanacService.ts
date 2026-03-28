/**
 * 黄历数据服务
 * Almanac Data Service
 * 
 * 实现宜忌、吉时、五行、冲煞等黄历信息的计算
 * Implements suitable/avoid activities, lucky hours, five elements, and clash info
 */

import type { AlmanacData } from '../types'
import { solarToLunar, getGanZhi } from './lunarService'

// ============================================
// 常量定义 (Constants)
// ============================================

/** 天干 Heavenly Stems */
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/** 地支 Earthly Branches */
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 天干对应五行 */
const GAN_WU_XING: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

/** 地支对应五行 */
const ZHI_WU_XING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
}

/** 地支冲克关系 (相冲) */
const ZHI_CHONG: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉',
  '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
  '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
}

/** 地支对应生肖 */
const ZHI_SHENG_XIAO: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
}

/** 煞方位 */
const SHA_DIRECTION: Record<string, string> = {
  '子': '南', '丑': '东', '寅': '北', '卯': '西',
  '辰': '南', '巳': '东', '午': '北', '未': '西',
  '申': '南', '酉': '东', '戌': '北', '亥': '西'
}

/** 宜事项列表 */
const SUITABLE_ACTIVITIES = [
  '祭祀', '祈福', '求嗣', '开光', '出行', '解除', '纳采',
  '冠笄', '嫁娶', '纳婿', '安床', '入宅', '安香', '谢土',
  '修造', '动土', '竖柱', '上梁', '开市', '交易', '立券',
  '纳财', '栽种', '牧养', '纳畜', '安葬', '启攒', '移柩',
  '入殓', '破土', '立碑', '会亲友', '出火', '拆卸', '起基',
  '定磉', '开池', '掘井', '造仓', '塞穴', '平治道涂', '裁衣',
  '合帐', '经络', '伐木', '作梁', '作灶', '沐浴', '理发'
]

/** 忌事项列表 */
const AVOID_ACTIVITIES = [
  '嫁娶', '开市', '安葬', '动土', '破土', '出行', '移徙',
  '入宅', '祭祀', '祈福', '开光', '安床', '作灶', '掘井',
  '纳畜', '伐木', '交易', '立券', '纳财', '栽种', '词讼',
  '安门', '修造', '上梁', '竖柱', '盖屋', '置产', '造船',
  '开仓', '出货', '开渠', '穿井', '行丧', '安葬', '启攒'
]

/** 十二时辰 */
const SHI_CHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 时辰对应时间 */
const SHI_CHEN_TIME: Record<string, string> = {
  '子': '23:00-01:00',
  '丑': '01:00-03:00',
  '寅': '03:00-05:00',
  '卯': '05:00-07:00',
  '辰': '07:00-09:00',
  '巳': '09:00-11:00',
  '午': '11:00-13:00',
  '未': '13:00-15:00',
  '申': '15:00-17:00',
  '酉': '17:00-19:00',
  '戌': '19:00-21:00',
  '亥': '21:00-23:00'
}

// ============================================
// 辅助函数 (Helper Functions)
// ============================================

/**
 * 获取天干索引
 */
function getGanIndex(gan: string): number {
  return TIAN_GAN.indexOf(gan)
}

/**
 * 获取地支索引
 */
function getZhiIndex(zhi: string): number {
  return DI_ZHI.indexOf(zhi)
}

/**
 * 根据日干支计算吉时
 * 使用青龙、明堂、金匮、天德、玉堂、司命六吉时
 */
function calculateLuckyHours(dayGanZhi: string): string[] {
  const dayZhi = dayGanZhi.charAt(1)
  const dayZhiIndex = getZhiIndex(dayZhi)
  
  // 六吉时的地支偏移（基于日支）
  // 青龙、明堂、金匮、天德、玉堂、司命
  const luckyOffsets = [0, 1, 4, 5, 8, 9]
  
  const luckyHours: string[] = []
  for (const offset of luckyOffsets) {
    const hourZhiIndex = (dayZhiIndex + offset) % 12
    const hourZhi = SHI_CHEN[hourZhiIndex]
    luckyHours.push(`${hourZhi}时 (${SHI_CHEN_TIME[hourZhi]})`)
  }
  
  return luckyHours
}

/**
 * 根据日干支计算宜忌
 * 使用简化的建除十二神算法
 */
function calculateSuitableAndAvoid(dayGanZhi: string): { suitable: string[], avoid: string[] } {
  const dayGan = dayGanZhi.charAt(0)
  const dayZhi = dayGanZhi.charAt(1)
  const ganIndex = getGanIndex(dayGan)
  const zhiIndex = getZhiIndex(dayZhi)
  
  // 使用干支组合的数值来确定宜忌
  const combinedIndex = (ganIndex * 12 + zhiIndex) % 60
  
  // 根据六十甲子的不同日子，选择不同的宜忌组合
  const suitableCount = 4 + (combinedIndex % 5) // 4-8个宜事项
  const avoidCount = 3 + (combinedIndex % 4) // 3-6个忌事项
  
  // 根据日干支选择宜事项
  const suitable: string[] = []
  const suitableStart = combinedIndex % SUITABLE_ACTIVITIES.length
  for (let i = 0; i < suitableCount; i++) {
    const index = (suitableStart + i * 7) % SUITABLE_ACTIVITIES.length
    suitable.push(SUITABLE_ACTIVITIES[index])
  }
  
  // 根据日干支选择忌事项（避免与宜事项重复）
  const avoid: string[] = []
  const avoidStart = (combinedIndex + 17) % AVOID_ACTIVITIES.length
  for (let i = 0; i < avoidCount; i++) {
    const index = (avoidStart + i * 5) % AVOID_ACTIVITIES.length
    const activity = AVOID_ACTIVITIES[index]
    if (!suitable.includes(activity)) {
      avoid.push(activity)
    }
  }
  
  // 确保至少有3个忌事项
  while (avoid.length < 3) {
    const index = (avoidStart + avoid.length * 3) % AVOID_ACTIVITIES.length
    const activity = AVOID_ACTIVITIES[index]
    if (!suitable.includes(activity) && !avoid.includes(activity)) {
      avoid.push(activity)
    }
  }
  
  return { suitable, avoid }
}

// ============================================
// 主要导出函数 (Main Export Functions)
// ============================================

/**
 * 获取当日宜事项
 * Get list of suitable activities for the date
 * 
 * @param date 公历日期
 * @returns 宜事项列表
 */
export function getSuitableActivities(date: Date): string[] {
  const ganZhi = getGanZhi(date)
  const { suitable } = calculateSuitableAndAvoid(ganZhi.day)
  return suitable
}

/**
 * 获取当日忌事项
 * Get list of activities to avoid for the date
 * 
 * @param date 公历日期
 * @returns 忌事项列表
 */
export function getAvoidActivities(date: Date): string[] {
  const ganZhi = getGanZhi(date)
  const { avoid } = calculateSuitableAndAvoid(ganZhi.day)
  return avoid
}

/**
 * 获取当日吉时
 * Get lucky hours for the date
 * 
 * @param date 公历日期
 * @returns 吉时列表
 */
export function getLuckyHours(date: Date): string[] {
  const ganZhi = getGanZhi(date)
  return calculateLuckyHours(ganZhi.day)
}

/**
 * 获取当日五行
 * Get five elements for the date
 * 
 * @param date 公历日期
 * @returns 五行信息
 */
export function getFiveElements(date: Date): string {
  const ganZhi = getGanZhi(date)
  const dayGan = ganZhi.day.charAt(0)
  const dayZhi = ganZhi.day.charAt(1)
  
  const ganElement = GAN_WU_XING[dayGan]
  const zhiElement = ZHI_WU_XING[dayZhi]
  
  return `${ganElement}${zhiElement}`
}

/**
 * 获取当日冲煞
 * Get clash info for the date
 * 
 * @param date 公历日期
 * @returns 冲煞信息
 */
export function getClash(date: Date): string {
  const ganZhi = getGanZhi(date)
  const dayZhi = ganZhi.day.charAt(1)
  
  const chongZhi = ZHI_CHONG[dayZhi]
  const chongShengXiao = ZHI_SHENG_XIAO[chongZhi]
  const shaDirection = SHA_DIRECTION[dayZhi]
  
  return `冲${chongShengXiao}(${chongZhi}) 煞${shaDirection}`
}

/**
 * 获取完整黄历数据
 * Get complete almanac data for a date
 * 
 * @param date 公历日期
 * @returns 完整黄历数据
 */
export function getAlmanacData(date: Date): AlmanacData {
  const lunarDate = solarToLunar(date)
  const ganZhi = getGanZhi(date)
  const { suitable, avoid } = calculateSuitableAndAvoid(ganZhi.day)
  const luckyHours = calculateLuckyHours(ganZhi.day)
  const fiveElements = getFiveElements(date)
  const clash = getClash(date)
  
  return {
    date,
    lunarDate,
    ganZhi,
    suitable,
    avoid,
    luckyHours,
    fiveElements,
    clash
  }
}
