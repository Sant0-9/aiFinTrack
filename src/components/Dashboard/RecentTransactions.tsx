'use client'

import { TransactionWithCategory } from '@/types'
import { formatCurrency, formatDateRelative } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions yet</p>
          <button className="mt-4 text-primary-600 hover:text-primary-700 font-medium">
            Add your first transaction
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${transaction.category.color}20` }}
              >
                {transaction.category.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{transaction.category.name}</span>
                  <span>•</span>
                  <span>{formatDateRelative(transaction.date)}</span>
                  {transaction.aiFlagged && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600 font-medium">AI Flagged</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-sm font-semibold ${
                transaction.type === 'INCOME' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </div>
              {transaction.necessityScore && (
                <div className="text-xs text-gray-500">
                  Necessity: {transaction.necessityScore}/10
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}