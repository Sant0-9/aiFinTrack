import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiCoach, FinancialContext } from '@/lib/openai'
import { z } from 'zod'

const consultationSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  description: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, category, description } = consultationSchema.parse(body)

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        transactions: {
          include: { category: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate spending statistics
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todaySpent, weekSpent, monthSpent] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfDay },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfWeek },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: 'EXPENSE',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ])

    // Build financial context
    const context: FinancialContext = {
      userId: session.user.id,
      monthlyIncome: user.monthlyIncome || 0,
      dailySpendingLimit: user.dailySpendingLimit || 50,
      currentSpentToday: todaySpent._sum.amount || 0,
      currentSpentThisWeek: weekSpent._sum.amount || 0,
      currentSpentThisMonth: monthSpent._sum.amount || 0,
      savingsGoal: user.savingsGoal || 0,
      targetDate: user.targetDate || new Date(),
      strictnessLevel: user.aiStrictnessLevel || 5,
      recentTransactions: user.transactions.map((t: any) => ({
        amount: t.amount,
        category: t.category.name,
        description: t.description,
        date: t.date,
      })),
    }

    // Get AI consultation
    const consultation = await aiCoach.consultOnPurchase({
      amount,
      category,
      description,
      context,
    })

    // Store the AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: session.user.id,
        interactionType: 'CONSULTATION',
        message: `Should I spend $${amount} on ${description}?`,
        response: consultation.message,
        contextData: {
          amount,
          category,
          description,
          recommendation: consultation.recommendation,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...consultation,
        riskLevel: consultation.recommendation === 'decline' ? 'high' :
                   consultation.recommendation === 'warn' ? 'medium' : 'low',
      },
    })
  } catch (error) {
    console.error('Error in AI consultation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}