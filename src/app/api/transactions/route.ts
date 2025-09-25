import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiCoach } from '@/lib/openai'
import { z } from 'zod'

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string(),
  description: z.string().min(1),
  date: z.string().datetime(),
  type: z.enum(['INCOME', 'EXPENSE']),
})

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '50')
    const offset = (page - 1) * limit

    const where: any = { userId: session.user.id }

    if (query.categoryId) where.categoryId = query.categoryId
    if (query.type) where.type = query.type
    if (query.startDate || query.endDate) {
      where.date = {}
      if (query.startDate) where.date.gte = new Date(query.startDate)
      if (query.endDate) where.date.lte = new Date(query.endDate)
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createTransactionSchema.parse(body)

    // Get AI categorization and necessity score
    const aiAnalysis = await aiCoach.categorizeTransaction(data.description, data.amount)

    // Check if category exists or create default
    let category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      // Create a category based on AI analysis if it doesn't exist
      category = await prisma.category.create({
        data: {
          name: aiAnalysis.category,
          color: '#3b82f6',
          icon: '📝',
          necessityLevel: Math.round(aiAnalysis.necessityScore / 2),
          isDefault: false,
          userId: session.user.id,
        },
      })
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: data.amount,
        categoryId: category.id,
        description: data.description,
        date: new Date(data.date),
        type: data.type,
        necessityScore: aiAnalysis.necessityScore,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully',
    })
  } catch (error) {
    console.error('Error creating transaction:', error)

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