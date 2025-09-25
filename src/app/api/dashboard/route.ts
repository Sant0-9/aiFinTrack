import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Date calculations
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get aggregated financial data
    const [
      totalIncome,
      totalExpenses,
      todayExpenses,
      weekExpenses,
      monthExpenses,
      recentTransactions,
      budgets,
      savingsGoals,
    ] = await Promise.all([
      // Total income this month
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'INCOME',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // Total expenses this month
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // Today's expenses
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfDay },
        },
        _sum: { amount: true },
      }),
      // This week's expenses
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfWeek },
        },
        _sum: { amount: true },
      }),
      // This month's expenses
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // Recent transactions
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      // Budgets with spending
      prisma.budget.findMany({
        where: { userId: session.user.id },
        include: { category: true },
      }),
      // Savings goals
      prisma.savingsGoal.findMany({
        where: { userId: session.user.id },
        orderBy: { priority: 'asc' },
      }),
    ])

    // Calculate budget progress
    const budgetProgress = await Promise.all(
      budgets.map(async (budget: any) => {
        let startDate: Date
        const now = new Date()

        switch (budget.period) {
          case 'DAILY':
            startDate = startOfDay
            break
          case 'WEEKLY':
            startDate = startOfWeek
            break
          case 'MONTHLY':
            startDate = startOfMonth
            break
          default:
            startDate = startOfMonth
        }

        const spent = await prisma.transaction.aggregate({
          where: {
            userId: session.user.id,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: { gte: startDate },
          },
          _sum: { amount: true },
        })

        return {
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          spent: spent._sum.amount || 0,
          budget: budget.amount,
          percentage: ((spent._sum.amount || 0) / budget.amount) * 100,
        }
      })
    )

    // Calculate savings progress
    const savingsProgress = savingsGoals.map((goal: any) => ({
      goalId: goal.id,
      goalName: goal.goalName,
      current: goal.currentSaved,
      target: goal.targetAmount,
      percentage: (goal.currentSaved / goal.targetAmount) * 100,
    }))

    // Build dashboard stats
    const stats = {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      currentBalance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      todaySpent: todayExpenses._sum.amount || 0,
      weekSpent: weekExpenses._sum.amount || 0,
      monthSpent: monthExpenses._sum.amount || 0,
      budgetProgress,
      savingsProgress,
      recentTransactions,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}