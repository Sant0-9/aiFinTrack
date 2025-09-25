import { User, Transaction, Category, Budget, AIInteraction, SavingsGoal, SpendingPlan } from '@prisma/client'

// Extended types with relations
export interface UserWithRelations extends User {
  transactions?: TransactionWithCategory[]
  categories?: Category[]
  budgets?: BudgetWithCategory[]
  aiInteractions?: AIInteraction[]
  savingsGoals?: SavingsGoal[]
  spendingPlans?: SpendingPlan[]
}

export interface TransactionWithCategory extends Transaction {
  category: Category
}

export interface BudgetWithCategory extends Budget {
  category: Category
}

// Form types
export interface TransactionFormData {
  amount: number
  categoryId: string
  description: string
  date: Date
  type: 'INCOME' | 'EXPENSE'
}

export interface CategoryFormData {
  name: string
  color: string
  icon: string
  necessityLevel: number
  spendingLimit?: number
}

export interface BudgetFormData {
  categoryId: string
  amount: number
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY'
}

export interface SavingsGoalFormData {
  goalName: string
  targetAmount: number
  targetDate: Date
  priority: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  currentBalance: number
  todaySpent: number
  weekSpent: number
  monthSpent: number
  budgetProgress: {
    categoryId: string
    categoryName: string
    spent: number
    budget: number
    percentage: number
  }[]
  savingsProgress: {
    goalId: string
    goalName: string
    current: number
    target: number
    percentage: number
  }[]
  recentTransactions: TransactionWithCategory[]
}

// AI types
export interface AIConsultationRequest {
  amount: number
  category: string
  description: string
}

export interface AIConsultationResponse {
  recommendation: 'approve' | 'warn' | 'decline'
  message: string
  alternatives?: string[]
  impactAnalysis: string
  riskLevel: 'low' | 'medium' | 'high'
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  amount: number
  category?: string
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Settings types
export interface UserSettings {
  dailySpendingLimit: number
  monthlyIncome: number
  aiEnabled: boolean
  aiStrictnessLevel: number
  notificationsEnabled: boolean
  currency: string
  theme: 'light' | 'dark' | 'system'
}

// Spending analysis types
export interface SpendingPattern {
  category: string
  averageAmount: number
  frequency: number
  trend: 'increasing' | 'decreasing' | 'stable'
  recommendation: string
}

export interface BudgetAlert {
  type: 'warning' | 'danger'
  category: string
  currentSpent: number
  budgetLimit: number
  percentage: number
  message: string
}

// Search and filter types
export interface TransactionFilters {
  startDate?: Date
  endDate?: Date
  categoryIds?: string[]
  type?: 'INCOME' | 'EXPENSE'
  minAmount?: number
  maxAmount?: number
  searchQuery?: string
}

// Achievement types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  progress: number
  target: number
  category: 'savings' | 'budgeting' | 'streaks' | 'goals'
}

// Export all types - no default export needed