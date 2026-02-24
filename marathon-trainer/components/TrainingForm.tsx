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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标PB</label>
          <input
            type="time"
            name="targetPB"
            value={formData.targetPB}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
