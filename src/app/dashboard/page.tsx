'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { StatsCard } from '@/components/Dashboard/StatsCard'
import { BudgetProgress } from '@/components/Dashboard/BudgetProgress'
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions'
import { AIInsights } from '@/components/Dashboard/AIInsights'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-8">You need to sign in to view your dashboard</p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AIFin</h1>
              <p className="text-sm text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button size="sm">
                + Add Transaction
              </Button>
              <Button variant="ghost" size="sm">
                Settings
              </Button>
              <Image
                src={session?.user?.image || '/default-avatar.png'}
                alt="Profile"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Current Balance"
            value={formatCurrency(stats.currentBalance)}
            icon={<span className="text-primary-600">💰</span>}
            trend={{
              value: 5.2,
              label: 'vs last month',
              type: stats.currentBalance > 0 ? 'positive' : 'negative'
            }}
          />

          <StatsCard
            title="Monthly Income"
            value={formatCurrency(stats.totalIncome)}
            icon={<span className="text-green-600">📈</span>}
          />

          <StatsCard
            title="Monthly Expenses"
            value={formatCurrency(stats.totalExpenses)}
            icon={<span className="text-red-600">📉</span>}
          />

          <StatsCard
            title="Today's Spending"
            value={formatCurrency(stats.todaySpent)}
            subtitle={`This week: ${formatCurrency(stats.weekSpent)}`}
            icon={<span className="text-orange-600">🛍️</span>}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <RecentTransactions transactions={stats.recentTransactions} />
            <BudgetProgress budgets={stats.budgetProgress} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIInsights
              insights={[
                {
                  message: `You're doing great! You've stayed within your budget for 3 days straight. Keep up this momentum to reach your savings goal by ${new Date().toLocaleDateString()}.`,
                  type: 'celebration',
                  confidence: 0.95
                },
                {
                  message: "Consider reducing dining out expenses this week. You've spent 40% more than usual on restaurants.",
                  type: 'recommendation',
                  confidence: 0.87
                }
              ]}
            />

            {/* Savings Goals Preview */}
            {stats.savingsProgress.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Goals</h3>
                <div className="space-y-4">
                  {stats.savingsProgress.slice(0, 3).map((goal) => (
                    <div key={goal.goalId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {goal.goalName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {goal.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  💬 Ask AI Financial Coach
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  📊 View Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  🎯 Set New Goal
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  📱 Mobile App Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}