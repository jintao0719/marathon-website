import { NextRequest, NextResponse } from 'next/server'
import { generateTrainingPlan } from '../../../lib/training'
import { UserInput } from '../../../lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: UserInput = await request.json()
    
    if (!body.raceType || !body.currentPB || !body.targetPB || !body.raceDate || !body.weeklyFrequency || !body.weeklyMileage) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    const trainingPlan = generateTrainingPlan(body)
    return NextResponse.json({ success: true, data: trainingPlan })
  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json({ error: '生成训练计划失败' }, { status: 500 })
  }
}
