'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface AIInsightProps {
  insights: {
    message: string
    type: 'tip' | 'warning' | 'celebration' | 'recommendation'
    confidence?: number
  }[]
}

export function AIInsights({ insights }: AIInsightProps) {
  const [currentInsight, setCurrentInsight] = useState(0)

  if (insights.length === 0) {
    insights = [{
      message: "Great job tracking your expenses! Keep it up to build healthy financial habits.",
      type: 'tip'
    }]
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return '💡'
      case 'warning':
        return '⚠️'
      case 'celebration':
        return '🎉'
      case 'recommendation':
        return '📊'
      default:
        return '🤖'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'celebration':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'recommendation':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const insight = insights[currentInsight]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Financial Coach</h3>
        <div className="flex items-center space-x-2">
          {insights.length > 1 && (
            <>
              <button
                onClick={() => setCurrentInsight((prev) => (prev - 1 + insights.length) % insights.length)}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={insights.length <= 1}
              >
                ←
              </button>
              <span className="text-xs text-gray-500">
                {currentInsight + 1} of {insights.length}
              </span>
              <button
                onClick={() => setCurrentInsight((prev) => (prev + 1) % insights.length)}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={insights.length <= 1}
              >
                →
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getInsightIcon(insight.type)}</span>
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{insight.message}</p>
            {insight.confidence && (
              <div className="mt-2 text-xs opacity-75">
                Confidence: {(insight.confidence * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          Ask AI a Question
        </Button>
        <button className="text-xs text-gray-500 hover:text-gray-700">
          More insights
        </button>
      </div>
    </div>
  )
}