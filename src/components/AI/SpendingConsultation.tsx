'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface ConsultationResponse {
  recommendation: 'approve' | 'warn' | 'decline'
  message: string
  alternatives?: string[]
  impactAnalysis: string
  riskLevel: 'low' | 'medium' | 'high'
}

export function SpendingConsultation() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [consultation, setConsultation] = useState<ConsultationResponse | null>(null)

  const handleConsult = async () => {
    if (!amount || !category || !description) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setConsultation(data.data)
      }
    } catch (error) {
      console.error('Error consulting AI:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProceed = async () => {
    // Create the transaction
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          categoryId: 'temp-category', // This would be dynamic
          description,
          date: new Date().toISOString(),
          type: 'EXPENSE',
        }),
      })

      if (response.ok) {
        // Reset form
        setAmount('')
        setCategory('')
        setDescription('')
        setConsultation(null)
        // Show success message
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return 'border-green-200 bg-green-50'
      case 'warn':
        return 'border-yellow-200 bg-yellow-50'
      case 'decline':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return '✅'
      case 'warn':
        return '⚠️'
      case 'decline':
        return '❌'
      default:
        return '🤔'
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
        <h2 className="text-xl font-bold">💬 Should I Buy This?</h2>
        <p className="text-primary-100 text-sm mt-1">
          Consult your AI financial coach before making a purchase
        </p>
      </div>

      <div className="p-6 space-y-4">
        {!consultation ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How much does it cost?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-8"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What category is this?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Select category</option>
                <option value="Food">Food & Dining</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transportation">Transportation</option>
                <option value="Bills">Bills & Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is it?
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch at restaurant, New headphones, etc."
                className="input-field"
              />
            </div>

            <Button
              onClick={handleConsult}
              disabled={!amount || !category || !description}
              loading={loading}
              className="w-full"
            >
              Ask AI Coach
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${getRecommendationColor(consultation.recommendation)}`}>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getRecommendationIcon(consultation.recommendation)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    AI Recommendation: {consultation.recommendation.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {consultation.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-1">Impact Analysis</h4>
              <p className="text-xs text-gray-600">{consultation.impactAnalysis}</p>
            </div>

            {consultation.alternatives && consultation.alternatives.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm mb-2">Alternatives to Consider</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {consultation.alternatives.map((alt, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>•</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              {consultation.recommendation !== 'decline' && (
                <Button
                  onClick={handleProceed}
                  variant={consultation.recommendation === 'approve' ? 'primary' : 'secondary'}
                  className="flex-1"
                >
                  Proceed with Purchase
                </Button>
              )}
              <Button
                onClick={() => setConsultation(null)}
                variant="ghost"
                className="flex-1"
              >
                {consultation.recommendation === 'decline' ? 'Reconsider' : 'Cancel'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}