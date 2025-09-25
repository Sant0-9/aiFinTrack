'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, calculatePercentage } from '@/lib/utils'

interface SpendingAlert {
  type: 'warning' | 'danger' | 'success'
  title: string
  message: string
  percentage?: number
  amount?: number
  limit?: number
}

interface SpendingAlertsProps {
  dailyLimit: number
  todaySpent: number
  weeklyLimit?: number
  weekSpent?: number
}

export function SpendingAlerts({
  dailyLimit,
  todaySpent,
  weeklyLimit,
  weekSpent = 0
}: SpendingAlertsProps) {
  const [alerts, setAlerts] = useState<SpendingAlert[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const newAlerts: SpendingAlert[] = []
    const dailyPercentage = calculatePercentage(todaySpent, dailyLimit)

    // Daily spending alerts
    if (todaySpent > dailyLimit) {
      newAlerts.push({
        type: 'danger',
        title: '🚨 Daily Budget Exceeded!',
        message: `You&apos;ve exceeded your daily limit by ${formatCurrency(todaySpent - dailyLimit)}. Consider pausing non-essential purchases.`,
        percentage: dailyPercentage,
        amount: todaySpent,
        limit: dailyLimit
      })
    } else if (dailyPercentage >= 90) {
      newAlerts.push({
        type: 'danger',
        title: '⚠️ Close to Daily Limit',
        message: `You&apos;ve used ${dailyPercentage.toFixed(0)}% of your daily budget. Only ${formatCurrency(dailyLimit - todaySpent)} remaining.`,
        percentage: dailyPercentage,
        amount: todaySpent,
        limit: dailyLimit
      })
    } else if (dailyPercentage >= 75) {
      newAlerts.push({
        type: 'warning',
        title: '⚡ Spending Alert',
        message: `You&apos;ve used ${dailyPercentage.toFixed(0)}% of your daily budget. Stay mindful of upcoming purchases.`,
        percentage: dailyPercentage,
        amount: todaySpent,
        limit: dailyLimit
      })
    } else if (dailyPercentage <= 25 && todaySpent > 0) {
      newAlerts.push({
        type: 'success',
        title: '✨ Great Control!',
        message: `Excellent spending discipline today! You&apos;re well within your daily budget.`,
        percentage: dailyPercentage,
        amount: todaySpent,
        limit: dailyLimit
      })
      // Trigger confetti for good behavior
      if (!showConfetti) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }

    // Weekly spending alerts if weekly limit is set
    if (weeklyLimit && weekSpent > 0) {
      const weeklyPercentage = calculatePercentage(weekSpent, weeklyLimit)

      if (weekSpent > weeklyLimit) {
        newAlerts.push({
          type: 'danger',
          title: '📊 Weekly Budget Exceeded',
          message: `You&apos;ve exceeded your weekly limit by ${formatCurrency(weekSpent - weeklyLimit)}.`,
          percentage: weeklyPercentage,
          amount: weekSpent,
          limit: weeklyLimit
        })
      } else if (weeklyPercentage >= 80) {
        newAlerts.push({
          type: 'warning',
          title: '📈 Weekly Budget Alert',
          message: `You&apos;ve used ${weeklyPercentage.toFixed(0)}% of your weekly budget.`,
          percentage: weeklyPercentage,
          amount: weekSpent,
          limit: weeklyLimit
        })
      }
    }

    setAlerts(newAlerts)
  }, [dailyLimit, todaySpent, weeklyLimit, weekSpent, showConfetti])

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const dismissAlert = (index: number) => {
    setAlerts(alerts.filter((_, i) => i !== index))
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getAlertStyles(alert.type)} relative`}
          >
            <button
              onClick={() => dismissAlert(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            <div className="pr-6">
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <p className="text-sm mt-1">{alert.message}</p>

              {alert.percentage && alert.amount && alert.limit && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{formatCurrency(alert.amount)} spent</span>
                    <span>{alert.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        alert.type === 'success' ? 'bg-green-600' :
                        alert.type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 text-right">
                    Limit: {formatCurrency(alert.limit)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}