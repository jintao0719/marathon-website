// 比赛类型
export type RaceType = 'full' | 'half' | '10k'

// 训练类型
export type TrainingType = 'long' | 'easy' | 'tempo' | 'interval' | 'recovery' | 'race'

// 里程增长模式
export type DistanceGrowthMode = 'fixed' | 'progressive'

// 用户输入
export interface UserInput {
  raceType: RaceType
  currentPB: string
  targetPB: string
  raceDate: string
  weeklyFrequency: number
  weeklyMileage: number
  currentWeeklyMileage?: number
  distanceGrowthMode: DistanceGrowthMode
}

// 训练会话
export interface TrainingSession {
  date: string
  type: TrainingType
  distance: number
  pace: string
  notes?: string
}

// 周计划
export interface TrainingWeek {
  number: number
  totalDistance: number
  sessions: TrainingSession[]
}

// 训练计划
export interface TrainingPlan {
  raceType: RaceType
  currentPB: string
  targetPB: string
  raceDate: string
  weeklyFrequency: number
  weeklyMileage: number
  weeks: TrainingWeek[]
}
