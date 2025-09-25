'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'authenticated') {
    // Redirect to dashboard if logged in
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard'
    }
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AIFin
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered finance tracker that helps prevent overspending
            and achieve your savings goals through intelligent coaching.
          </p>

          <div className="mb-8">
            <Button
              size="lg"
              onClick={() => window.location.href = '/auth/signin'}
              className="mr-4"
            >
              Get Started Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/demo'}
            >
              View Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Financial Coach</h3>
              <p className="text-gray-600 text-sm">
                Get personalized advice before every purchase. Our AI prevents overspending and celebrates your wins.
              </p>
            </div>

            <div className="card">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
              <p className="text-gray-600 text-sm">
                Understand your spending patterns with AI-powered insights and predictions.
              </p>
            </div>

            <div className="card">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal Achievement</h3>
              <p className="text-gray-600 text-sm">
                Set and achieve savings goals with personalized strategies and motivation.
              </p>
            </div>

            <div className="card">
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Alerts</h3>
              <p className="text-gray-600 text-sm">
                Get warned before overspending with intelligent budget monitoring.
              </p>
            </div>

            <div className="card">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600 text-sm">
                Beautiful, responsive design that works perfectly on all devices.
              </p>
            </div>

            <div className="card">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Your financial data is encrypted and never shared. Privacy first.
              </p>
            </div>
          </div>

          <div className="mt-12 card max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of users who&apos;ve already improved their financial health with AI-powered coaching.
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}