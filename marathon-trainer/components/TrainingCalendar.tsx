'use client'

import { useEffect, useState } from 'react'
import { TrainingPlan, TrainingSession } from '../lib/types'

const TrainingCalendar: React.FC = () => {
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedPlan = localStorage.getItem('trainingPlan')
    if (savedPlan) {
      try {
        setTrainingPlan(JSON.parse(savedPlan))
      } catch (error) {
        console.error('解析训练计划失败:', error)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!trainingPlan) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无训练计划</h3>
          <p className="text-gray-500">请在左侧填写训练计划设置并生成计划</p>
        </div>
      </div>
    )
  }

  const getSessionTypeColor = (type: TrainingSession['type']) => {
    switch (type) {
      case 'long':
        return 'bg-green-100 border-green-300'
      case 'easy':
        return 'bg-blue-100 border-blue-300'
      case 'tempo':
        return 'bg-yellow-100 border-yellow-300'
      case 'interval':
        return 'bg-red-100 border-red-300'
      case 'recovery':
        return 'bg-purple-100 border-purple-300'
      case 'race':
        return 'bg-orange-100 border-orange-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getSessionTypeName = (type: TrainingSession['type']) => {
    switch (type) {
      case 'long':
        return '长距离跑'
      case 'easy':
        return '轻松跑'
      case 'tempo':
        return '节奏跑'
      case 'interval':
        return '间歇跑'
      case 'recovery':
        return '恢复跑'
      case 'race':
        return '比赛'
      default:
        return '跑步'
    }
  }

  const getSessionTypeDescription = (type: TrainingSession['type']) => {
    switch (type) {
      case 'long':
        return '以较慢的配速进行长距离训练，增强耐力和心肺功能'
      case 'easy':
        return '以舒适的配速进行训练，促进恢复和基础耐力建设'
      case 'tempo':
        return '以接近乳酸阈值的配速训练，提高有氧能力'
      case 'interval':
        return '高强度间歇训练，提高速度和无氧能力'
      case 'recovery':
        return '低强度恢复跑，促进身体恢复和血液循环'
      case 'race':
        return '模拟比赛强度的训练，适应比赛节奏'
      default:
        return '常规跑步训练'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">训练计划日历</h2>
        <div className="text-sm text-gray-500">
          比赛日期: {new Date(trainingPlan.raceDate).toLocaleDateString('zh-CN')}
        </div>
      </div>

      {/* 训练类型说明 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-medium mb-3">训练类型说明</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(['long', 'easy', 'tempo', 'interval', 'recovery', 'race'] as TrainingSession['type'][]).map((type) => (
            <div key={type} className={`p-2 rounded border ${getSessionTypeColor(type)}`}>
              <div className="font-medium text-sm mb-1">{getSessionTypeName(type)}</div>
              <div className="text-xs text-gray-600">{getSessionTypeDescription(type)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 横排训练日历 */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {trainingPlan.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="mb-6">
              <div className="bg-gray-50 px-4 py-2 border rounded-t-lg flex justify-between items-center">
                <h3 className="font-medium">第 {weekIndex + 1} 周</h3>
                <span className="text-sm font-semibold">总里程: {week.totalDistance} 公里</span>
              </div>
              <div className="flex border-x border-b rounded-b-lg overflow-hidden">
                {week.sessions.map((session, sessionIndex) => (
                  <div 
                    key={sessionIndex} 
                    className={`flex-1 p-3 ${getSessionTypeColor(session.type)} border-r last:border-r-0`}
                  >
                    <div className="text-center mb-2">
                      <span className="font-medium">{getSessionTypeName(session.type)}</span>
                    </div>
                    <div className="text-sm text-center mb-1">
                      {new Date(session.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </div>
                    <div className="text-sm text-center mb-1">
                      <span className="text-gray-600">距离:</span> {session.distance} 公里
                    </div>
                    <div className="text-sm text-center mb-2">
                      <span className="text-gray-600">配速:</span> {session.pace}
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      {getSessionTypeDescription(session.type)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TrainingCalendar
