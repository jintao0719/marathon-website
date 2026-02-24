'use client'

import { useState } from 'react'

interface FormData {
  raceType: 'full' | 'half' | '10k'
  currentPB: string
  targetPB: string
  raceDate: string
  weeklyFrequency: number
  weeklyMileage: number
  currentWeeklyMileage?: number
  distanceGrowthMode: 'fixed' | 'progressive'
}

const defaultFormData: FormData = {
  raceType: 'full',
  currentPB: '4:30:00',
  targetPB: '4:00:00',
  raceDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  weeklyFrequency: 5,
  weeklyMileage: 40,
  currentWeeklyMileage: 30,
  distanceGrowthMode: 'progressive'
}

const TrainingForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // 处理时间输入验证
    if ((name === 'currentPB' || name === 'targetPB') && value) {
      const timeRange = getTimeRange(formData.raceType)
      const inputTimeSeconds = timeToSeconds(value)
      const minTimeSeconds = timeToSeconds(timeRange.min)
      const maxTimeSeconds = timeToSeconds(timeRange.max)
      
      // 验证时间范围
      if (inputTimeSeconds < minTimeSeconds || inputTimeSeconds > maxTimeSeconds) {
        setError(`${getRaceTypeName(formData.raceType)}${name === 'currentPB' ? '当前PB' : '目标PB'}时间应在 ${timeRange.min} 到 ${timeRange.max} 之间`)
      } else {
        setError('')
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  // 根据比赛类型获取时间范围
  const getTimeRange = (raceType: FormData['raceType']) => {
    switch (raceType) {
      case 'full':
        return { min: '02:00:00', max: '08:00:00' }
      case 'half':
        return { min: '01:00:00', max: '04:00:00' }
      case '10k':
        return { min: '00:30:00', max: '02:00:00' }
      default:
        return { min: '00:00:00', max: '23:59:59' }
    }
  }

  // 获取比赛类型名称
  const getRaceTypeName = (raceType: FormData['raceType']) => {
    switch (raceType) {
      case 'full':
        return '全程马拉松'
      case 'half':
        return '半程马拉松'
      case '10k':
        return '10公里'
      default:
        return ''
    }
  }

  // 将时间字符串转换为秒数
  const timeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    return hours * 3600 + minutes * 60 + (seconds || 0)
  }

  // 将秒数转换为时间字符串
  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 验证 PB 时间范围
      const currentPBSeconds = timeToSeconds(formData.currentPB)
      const targetPBSeconds = timeToSeconds(formData.targetPB)
      
      // 根据比赛类型设置时间范围
      let minTimeSeconds: number, maxTimeSeconds: number
      switch (formData.raceType) {
        case 'full':
          minTimeSeconds = 2 * 3600 // 2小时
          maxTimeSeconds = 8 * 3600 // 8小时
          break
        case 'half':
          minTimeSeconds = 1 * 3600 // 1小时
          maxTimeSeconds = 4 * 3600 // 4小时
          break
        case '10k':
          minTimeSeconds = 0.5 * 3600 // 30分钟
          maxTimeSeconds = 2 * 3600 // 2小时
          break
        default:
          minTimeSeconds = 0
          maxTimeSeconds = 24 * 3600
      }
      
      // 验证当前 PB
      if (currentPBSeconds < minTimeSeconds || currentPBSeconds > maxTimeSeconds) {
        throw new Error(`${getRaceTypeName(formData.raceType)}当前PB时间范围应在 ${secondsToTime(minTimeSeconds)} 到 ${secondsToTime(maxTimeSeconds)} 之间`)
      }
      
      // 验证目标 PB
      if (targetPBSeconds < minTimeSeconds || targetPBSeconds > maxTimeSeconds) {
        throw new Error(`${getRaceTypeName(formData.raceType)}目标PB时间范围应在 ${secondsToTime(minTimeSeconds)} 到 ${secondsToTime(maxTimeSeconds)} 之间`)
      }
      
      // 验证目标 PB 不大于当前 PB
      if (targetPBSeconds >= currentPBSeconds) {
        throw new Error('目标PB应小于当前PB')
      }

      const response = await fetch('/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('生成训练计划失败')
      }

      const result = await response.json()
      if (result.success) {
        localStorage.setItem('trainingPlan', JSON.stringify(result.data))
        window.location.reload()
      } else {
        throw new Error(result.error || '生成训练计划失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成训练计划失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">训练计划设置</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">比赛类型</label>
          <select
            name="raceType"
            value={formData.raceType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="full">全程马拉松 (42.195km)</option>
            <option value="half">半程马拉松 (21.0975km)</option>
            <option value="10k">10公里</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">当前PB</label>
          <input
            type="time"
            name="currentPB"
            value={formData.currentPB}
            onChange={handleInputChange}
            min={getTimeRange(formData.raceType).min}
            max={getTimeRange(formData.raceType).max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {getRaceTypeName(formData.raceType)}时间范围: {getTimeRange(formData.raceType).min} - {getTimeRange(formData.raceType).max}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标PB</label>
          <input
            type="time"
            name="targetPB"
            value={formData.targetPB}
            onChange={handleInputChange}
            min={getTimeRange(formData.raceType).min}
            max={getTimeRange(formData.raceType).max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {getRaceTypeName(formData.raceType)}时间范围: {getTimeRange(formData.raceType).min} - {getTimeRange(formData.raceType).max}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">比赛日期</label>
          <input
            type="date"
            name="raceDate"
            value={formData.raceDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">每周训练次数</label>
          <select
            name="weeklyFrequency"
            value={formData.weeklyFrequency}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {[3, 4, 5, 6, 7].map(num => (
              <option key={num} value={num}>{num}次</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标周里程 (公里)</label>
          <input
            type="number"
            name="weeklyMileage"
            value={formData.weeklyMileage}
            onChange={handleInputChange}
            min="10"
            max="120"
            step="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">当前周里程 (公里)</label>
          <input
            type="number"
            name="currentWeeklyMileage"
            value={formData.currentWeeklyMileage || ''}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">里程增长模式</label>
          <select
            name="distanceGrowthMode"
            value={formData.distanceGrowthMode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="progressive">渐进式增长</option>
            <option value="fixed">固定里程</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '生成中...' : '生成训练计划'}
        </button>
      </form>
    </div>
  )
}

export default TrainingForm
