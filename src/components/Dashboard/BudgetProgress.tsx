'use client'

import { formatCurrency, calculatePercentage, getProgressColor } from '@/lib/utils'

interface BudgetProgressItem {
  categoryId: string
  categoryName: string
  spent: number
  budget: number
  percentage: number
}

interface BudgetProgressProps {
  budgets: BudgetProgressItem[]
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No budgets set up yet</p>
          <button className="mt-4 text-primary-600 hover:text-primary-700 font-medium">
            Create your first budget
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = calculatePercentage(budget.spent, budget.budget)
          const isOverBudget = budget.spent > budget.budget

          return (
            <div key={budget.categoryId} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {budget.categoryName}
                </span>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                  </div>
                  <div className={`text-xs ${getProgressColor(percentage)}`}>
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isOverBudget ? 'bg-red-500' :
                    percentage > 75 ? 'bg-orange-500' :
                    percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`
                  }}
                />
              </div>

              {isOverBudget && (
                <div className="text-xs text-red-600 font-medium">
                  Over budget by {formatCurrency(budget.spent - budget.budget)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}