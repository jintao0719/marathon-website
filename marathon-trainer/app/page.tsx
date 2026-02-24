import TrainingForm from '../components/TrainingForm'
import TrainingCalendar from '../components/TrainingCalendar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">马拉松训练规划</h1>
          <p className="text-gray-600">为您定制科学的马拉松训练计划</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TrainingForm />
          </div>
          <div className="lg:col-span-2">
            <TrainingCalendar />
          </div>
        </div>
      </div>
    </div>
  )
}
