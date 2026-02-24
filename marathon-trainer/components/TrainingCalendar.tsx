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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">训练计划日历</h2>
        <div className="text-sm text-gray-500">
          比赛日期: {new Date(trainingPlan.raceDate).toLocaleDateString('zh-CN')}
        </div>
      </div>

      <div className="space-y-6">
        {trainingPlan.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <h3 className="font-medium">第 {weekIndex + 1} 周</h3>
              <span className="text-sm font-semibold">总里程: {week.totalDistance} 公里</span>
            </div>
            <div className="p-4 space-y-3">
              {week.sessions.map((session, sessionIndex) => (
                <div 
                  key={sessionIndex} 
                  className={`border rounded-lg p-3 ${getSessionTypeColor(session.type)}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <span className="font-medium">{getSessionTypeName(session.type)}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-gray-500">距离:</span> {session.distance} 公里
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">配速:</span> {session.pace}
                    </div>
                  </div>
                  {session.notes && (
                    <div className="mt-2 text-xs text-gray-600">
                      {session.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrainingCalendar
