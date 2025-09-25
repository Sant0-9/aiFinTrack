'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { SpendingConsultation } from '@/components/AI/SpendingConsultation'
import { SpendingAlerts } from '@/components/AI/SpendingAlerts'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'

export default function ConsultPage() {
  const { data: session, status } = useSession()
  const [userSettings, setUserSettings] = useState({
    dailyLimit: 50,
    todaySpent: 0,
    weeklyLimit: 300,
    weekSpent: 0,
  })

  useEffect(() => {
    if (status === 'authenticated') {
      // Fetch user's spending data and limits
      fetchUserSpendingData()
    }
  }, [status])

  const fetchUserSpendingData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserSettings(prev => ({
            ...prev,
            todaySpent: data.data.todaySpent,
            weekSpent: data.data.weekSpent,
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching spending data:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
              >
                ← Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Financial Coach</h1>
                <p className="text-sm text-gray-600">Get smart spending advice before you buy</p>
              </div>
            </div>
            <Image
              src={session?.user?.image || '/default-avatar.png'}
              alt="Profile"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main consultation interface */}
          <div className="lg:col-span-2">
            <SpendingConsultation />

            {/* Tips Section */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Smart Spending Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Wait 24 Hours</h4>
                  <p className="text-blue-700 text-sm">
                    For purchases over $50, wait a day before buying to avoid impulse spending.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Check Alternatives</h4>
                  <p className="text-green-700 text-sm">
                    Look for similar items at lower prices or consider borrowing instead of buying.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Track Your Goals</h4>
                  <p className="text-purple-700 text-sm">
                    Remember what you&apos;re saving for and how this purchase affects those goals.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Use the 50/30/20 Rule</h4>
                  <p className="text-yellow-700 text-sm">
                    50% needs, 30% wants, 20% savings and debt repayment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar with alerts and stats */}
          <div className="space-y-6">
            {/* Spending Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Spending</h3>
              <SpendingAlerts
                dailyLimit={userSettings.dailyLimit}
                todaySpent={userSettings.todaySpent}
                weeklyLimit={userSettings.weeklyLimit}
                weekSpent={userSettings.weekSpent}
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today&apos;s Budget</span>
                  <span className="font-medium">${userSettings.dailyLimit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today&apos;s Spending</span>
                  <span className="font-medium text-red-600">${userSettings.todaySpent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="font-medium text-green-600">
                    ${Math.max(0, userSettings.dailyLimit - userSettings.todaySpent)}
                  </span>
                </div>
                <hr />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weekly Spending</span>
                  <span className="font-medium">${userSettings.weekSpent}</span>
                </div>
              </div>
            </div>

            {/* AI Coach Status */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold">AI Coach Active</h3>
                  <p className="text-primary-100 text-sm">Ready to help you make smart decisions</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Consultations Today</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Money Saved</span>
                  <span className="font-semibold">$47.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}