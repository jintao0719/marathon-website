import { UserInput, TrainingPlan, TrainingSession, TrainingType, TrainingWeek, RaceType } from './types'

// 将时间字符串转换为秒数
const timeToSeconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return hours * 3600 + minutes * 60 + (seconds || 0)
}

// 将秒数转换为配速字符串 (分:秒/公里)
const secondsToPace = (seconds: number): string => {
  const totalMinutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60) // 四舍五入到最近的秒
  return `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 计算不同训练类型的配速
const getPaceForSession = (type: TrainingType, targetPaceSeconds: number): string => {
  switch (type) {
    case 'easy':
      return secondsToPace(targetPaceSeconds * 1.2)
    case 'long':
      return secondsToPace(targetPaceSeconds * 1.15)
    case 'tempo':
      return secondsToPace(targetPaceSeconds * 1.05)
    case 'interval':
      return secondsToPace(targetPaceSeconds * 0.9)
    case 'recovery':
      return secondsToPace(targetPaceSeconds * 1.3)
    case 'race':
      return secondsToPace(targetPaceSeconds)
    default:
      return secondsToPace(targetPaceSeconds)
  }
}

// 获取长距离跑的距离
const getLongRunDistance = (weekDistance: number, raceType: RaceType, weekNumber: number, totalWeeks: number): number => {
  const baseLongRunPercentage = raceType === 'full' ? 0.3 : raceType === 'half' ? 0.35 : 0.4
  const peakLongRunPercentage = raceType === 'full' ? 0.4 : raceType === 'half' ? 0.5 : 0.6
  
  // 计算长距离跑的增长曲线
  const progress = weekNumber / totalWeeks
  const percentage = baseLongRunPercentage + (peakLongRunPercentage - baseLongRunPercentage) * Math.min(progress * 2, 1)
  
  return Math.round(weekDistance * percentage * 10) / 10
}

// 计算每周的总距离
const getWeekDistance = (userInput: UserInput, weekNumber: number, totalWeeks: number): number => {
  const { weeklyMileage, currentWeeklyMileage, distanceGrowthMode } = userInput
  
  if (distanceGrowthMode === 'fixed' || !currentWeeklyMileage) {
    return weeklyMileage
  }
  
  // 渐进式增长
  const growthRate = (weeklyMileage - currentWeeklyMileage) / totalWeeks
  const weekDistance = currentWeeklyMileage + growthRate * weekNumber
  
  // 确保距离不超过目标周里程
  return Math.min(Math.round(weekDistance), weeklyMileage)
}

// 获取单个训练会话的距离
const getSessionDistance = (totalDistance: number, sessionCount: number, sessionIndex: number, longRunDistance?: number): number => {
  if (longRunDistance && sessionIndex === sessionCount - 1) {
    return longRunDistance
  }
  
  const remainingDistance = totalDistance - (longRunDistance || 0)
  const baseDistance = remainingDistance / (sessionCount - (longRunDistance ? 1 : 0))
  
  // 为不同位置的会话分配不同的距离
  if (sessionIndex === 0) {
    return Math.round(baseDistance * 0.9 * 10) / 10
  } else if (sessionIndex === 1) {
    return Math.round(baseDistance * 1.1 * 10) / 10
  } else {
    return Math.round(baseDistance * 10) / 10
  }
}

// 生成每周的训练会话
const generateWeekSessions = (userInput: UserInput, weekNumber: number, totalWeeks: number, startDate: Date): TrainingSession[] => {
  const { weeklyFrequency, raceType } = userInput
  const weekDistance = getWeekDistance(userInput, weekNumber, totalWeeks)
  const longRunDistance = getLongRunDistance(weekDistance, raceType, weekNumber, totalWeeks)
  
  // 计算目标配速
  const targetPaceSeconds = timeToSeconds(userInput.targetPB) / (raceType === 'full' ? 42.195 : raceType === 'half' ? 21.0975 : 10)
  
  // 定义训练类型顺序
  const trainingTypes: TrainingType[] = ['easy', 'easy', 'tempo', 'interval', 'recovery', 'easy', 'long']
  
  // 选择前 weeklyFrequency 个训练类型
  const selectedTypes = trainingTypes.slice(0, weeklyFrequency)
  
  // 生成会话
  const sessions: TrainingSession[] = []
  let totalAssignedDistance = 0
  
  selectedTypes.forEach((type, index) => {
    const distance = getSessionDistance(weekDistance, selectedTypes.length, index, type === 'long' ? longRunDistance : undefined)
    totalAssignedDistance += distance
    
    const date = new Date(startDate)
    date.setDate(date.getDate() + index)
    
    sessions.push({
      date: date.toISOString().split('T')[0],
      type,
      distance,
      pace: getPaceForSession(type, targetPaceSeconds)
    })
  })
  
  // 调整距离以确保总和正确
  const distanceDifference = weekDistance - totalAssignedDistance
  if (distanceDifference !== 0) {
    // 将差异分配给最后一个会话
    sessions[sessions.length - 1].distance = Math.round((sessions[sessions.length - 1].distance + distanceDifference) * 10) / 10
  }
  
  return sessions
}

// 生成训练计划
export const generateTrainingPlan = (userInput: UserInput): TrainingPlan => {
  const { raceDate } = userInput
  const raceDateObj = new Date(raceDate)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 1) // 从明天开始
  
  // 计算训练周数 (至少 8 周，最多 24 周)
  const weeksUntilRace = Math.max(8, Math.min(24, Math.floor((raceDateObj.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))))
  
  const weeks: TrainingWeek[] = []
  
  for (let i = 1; i <= weeksUntilRace; i++) {
    const weekStartDate = new Date(startDate)
    weekStartDate.setDate(startDate.getDate() + (i - 1) * 7)
    
    const sessions = generateWeekSessions(userInput, i, weeksUntilRace, weekStartDate)
    const totalDistance = Math.round(sessions.reduce((sum, session) => sum + session.distance, 0))
    
    weeks.push({
      number: i,
      totalDistance,
      sessions
    })
  }
  
  return {
    ...userInput,
    weeks
  }
}

// 获取训练类型的名称
export const getTrainingTypeName = (type: TrainingType): string => {
  const typeNames: Record<TrainingType, string> = {
    long: '长距离跑',
    easy: '轻松跑',
    tempo: '节奏跑',
    interval: '间歇跑',
    recovery: '恢复跑',
    race: '比赛'
  }
  return typeNames[type]
}

// 获取跑步者水平的名称
export const getRunnerLevelName = (raceType: RaceType, pbSeconds: number): string => {
  const thresholds: Record<RaceType, { beginner: number, intermediate: number, advanced: number }> = {
    full: { beginner: 4.5 * 3600, intermediate: 3.5 * 3600, advanced: 3 * 3600 },
    half: { beginner: 2.25 * 3600, intermediate: 1.75 * 3600, advanced: 1.5 * 3600 },
    '10k': { beginner: 1 * 3600, intermediate: 0.75 * 3600, advanced: 0.6 * 3600 }
  }
  
  const { beginner, intermediate, advanced } = thresholds[raceType]
  
  if (pbSeconds >= beginner) {
    return '初学者'
  } else if (pbSeconds >= intermediate) {
    return '中级跑者'
  } else if (pbSeconds >= advanced) {
    return '高级跑者'
  } else {
    return '精英跑者'
  }
}
