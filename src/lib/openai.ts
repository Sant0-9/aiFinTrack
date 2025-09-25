import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FinancialContext {
  userId: string
  monthlyIncome: number
  dailySpendingLimit: number
  currentSpentToday: number
  currentSpentThisWeek: number
  currentSpentThisMonth: number
  savingsGoal: number
  targetDate: Date
  strictnessLevel: number
  recentTransactions: Array<{
    amount: number
    category: string
    description: string
    date: Date
  }>
}

export interface SpendingConsultation {
  amount: number
  category: string
  description: string
  context: FinancialContext
}

export class AIFinancialCoach {
  private systemPrompt = `You are a helpful, firm but encouraging AI financial coach. Your role is to:

1. Help users make better spending decisions
2. Prevent unnecessary purchases that derail financial goals
3. Celebrate achievements and progress
4. Provide personalized financial advice based on their situation
5. Be supportive but honest about financial realities

Personality traits:
- Supportive but realistic
- Encouraging yet firm when needed
- Understanding of human psychology around money
- Focused on long-term financial health
- Use encouraging language but be direct about consequences

Always consider the user's:
- Income and spending patterns
- Savings goals and timelines
- Current financial stress level
- Recent spending behavior
- AI strictness preference (1-10 scale)

Respond in a conversational, friendly but professional tone. Keep responses concise but helpful.`

  async consultOnPurchase(consultation: SpendingConsultation): Promise<{
    recommendation: 'approve' | 'warn' | 'decline'
    message: string
    alternatives?: string[]
    impactAnalysis: string
  }> {
    const { amount, category, description, context } = consultation

    const userPrompt = `
User wants to spend $${amount} on ${description} (Category: ${category})

Current Financial Situation:
- Monthly Income: $${context.monthlyIncome}
- Daily Limit: $${context.dailySpendingLimit}
- Already spent today: $${context.currentSpentToday}
- This week: $${context.currentSpentThisWeek}
- This month: $${context.currentSpentThisMonth}
- Savings Goal: $${context.savingsGoal}
- Target Date: ${context.targetDate.toDateString()}
- AI Strictness Level: ${context.strictnessLevel}/10

Recent transactions:
${context.recentTransactions.map(t =>
  `- $${t.amount} on ${t.description} (${t.category}) - ${t.date.toDateString()}`
).join('\n')}

Should I approve this purchase? Provide:
1. Recommendation (approve/warn/decline)
2. Brief explanation
3. Impact analysis
4. Alternative suggestions if declining/warning
`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content || ""

      // Parse the response to extract structured data
      const recommendation = this.parseRecommendation(response, context.strictnessLevel, amount, context.dailySpendingLimit)

      return {
        recommendation,
        message: response,
        alternatives: this.extractAlternatives(response),
        impactAnalysis: this.generateImpactAnalysis(amount, context)
      }
    } catch (error) {
      console.error('OpenAI API error:', error)

      // Fallback logic when AI is unavailable
      return this.fallbackConsultation(consultation)
    }
  }

  async generateWeeklyReport(context: FinancialContext): Promise<string> {
    const userPrompt = `
Generate a weekly financial health report for this user:

Financial Situation:
- Monthly Income: $${context.monthlyIncome}
- This week spent: $${context.currentSpentThisWeek}
- This month spent: $${context.currentSpentThisMonth}
- Savings Goal: $${context.savingsGoal}
- Target Date: ${context.targetDate.toDateString()}

Recent transactions:
${context.recentTransactions.slice(0, 10).map(t =>
  `- $${t.amount} on ${t.description} (${t.category}) - ${t.date.toDateString()}`
).join('\n')}

Provide:
1. Overall assessment
2. Spending patterns observed
3. Progress toward goals
4. Specific recommendations
5. Motivation and encouragement

Keep it personal, actionable, and encouraging.`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
      })

      return completion.choices[0]?.message?.content || "Unable to generate report at this time."
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.fallbackWeeklyReport(context)
    }
  }

  async categorizeTransaction(description: string, amount: number): Promise<{
    category: string
    necessityScore: number
    confidence: number
  }> {
    const userPrompt = `
Categorize this transaction and rate its necessity:
Amount: $${amount}
Description: "${description}"

Provide:
1. Most appropriate category (Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Education, etc.)
2. Necessity score (1-10, where 1=luxury, 10=essential)
3. Confidence level (0.1-1.0)

Consider the amount and description to make your assessment.`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.3,
      })

      const response = completion.choices[0]?.message?.content || ""

      return this.parseCategorization(response, description, amount)
    } catch (error) {
      console.error('OpenAI API error:', error)

      // Fallback categorization
      return this.fallbackCategorization(description, amount)
    }
  }

  private parseRecommendation(response: string, strictnessLevel: number, amount: number, dailyLimit: number): 'approve' | 'warn' | 'decline' {
    const lowerResponse = response.toLowerCase()

    if (lowerResponse.includes('decline') || lowerResponse.includes('not recommend')) {
      return 'decline'
    }

    if (lowerResponse.includes('warn') || lowerResponse.includes('caution')) {
      return 'warn'
    }

    // Fallback logic based on rules
    const overLimitFactor = amount / dailyLimit

    if (strictnessLevel >= 8 && overLimitFactor > 0.5) {
      return 'decline'
    }

    if (strictnessLevel >= 5 && overLimitFactor > 0.3) {
      return 'warn'
    }

    return 'approve'
  }

  private extractAlternatives(response: string): string[] {
    const alternatives: string[] = []
    const lines = response.split('\n')

    lines.forEach(line => {
      if (line.toLowerCase().includes('alternative') ||
          line.toLowerCase().includes('instead') ||
          line.includes('•') ||
          line.includes('-')) {
        alternatives.push(line.trim())
      }
    })

    return alternatives.slice(0, 3) // Return up to 3 alternatives
  }

  private generateImpactAnalysis(amount: number, context: FinancialContext): string {
    const remainingBudget = context.dailySpendingLimit - context.currentSpentToday
    const impactOnGoal = (amount / context.savingsGoal) * 100

    return `This $${amount} purchase would use ${((amount / remainingBudget) * 100).toFixed(1)}% of your remaining daily budget and delay your savings goal by ${impactOnGoal.toFixed(2)}%.`
  }

  private fallbackConsultation(consultation: SpendingConsultation) {
    const { amount, context } = consultation
    const remainingBudget = context.dailySpendingLimit - context.currentSpentToday

    if (amount > remainingBudget) {
      return {
        recommendation: 'decline' as const,
        message: `This purchase exceeds your remaining daily budget of $${remainingBudget.toFixed(2)}. Consider waiting until tomorrow or adjusting your budget.`,
        alternatives: ['Wait until tomorrow', 'Look for a less expensive alternative', 'Check if this is really necessary'],
        impactAnalysis: this.generateImpactAnalysis(amount, context)
      }
    }

    if (amount > remainingBudget * 0.5) {
      return {
        recommendation: 'warn' as const,
        message: `This purchase would use a significant portion of your remaining daily budget. Are you sure it's necessary?`,
        alternatives: ['Consider postponing', 'Look for discounts', 'Check if you really need this now'],
        impactAnalysis: this.generateImpactAnalysis(amount, context)
      }
    }

    return {
      recommendation: 'approve' as const,
      message: `This looks reasonable within your budget. Enjoy your purchase responsibly!`,
      alternatives: [],
      impactAnalysis: this.generateImpactAnalysis(amount, context)
    }
  }

  private fallbackWeeklyReport(context: FinancialContext): string {
    const weeklyBudget = context.dailySpendingLimit * 7
    const spendingRatio = context.currentSpentThisWeek / weeklyBudget

    let assessment = ""
    if (spendingRatio > 1.2) {
      assessment = "You've exceeded your weekly budget significantly. Let's focus on getting back on track."
    } else if (spendingRatio > 1.0) {
      assessment = "You're slightly over your weekly budget, but nothing too concerning."
    } else if (spendingRatio > 0.8) {
      assessment = "You're doing well staying within your budget this week!"
    } else {
      assessment = "Excellent budget discipline this week! Keep up the great work."
    }

    return `Weekly Financial Report:\n\n${assessment}\n\nThis week you spent $${context.currentSpentThisWeek} out of your $${weeklyBudget} budget.\n\nKeep focusing on your savings goal of $${context.savingsGoal}. Every dollar saved gets you closer!`
  }

  private parseCategorization(response: string, description: string, amount: number) {
    // Simple fallback categorization logic
    const lowerDesc = description.toLowerCase()

    let category = "Other"
    let necessityScore = 5

    if (lowerDesc.includes('food') || lowerDesc.includes('grocery') || lowerDesc.includes('restaurant')) {
      category = "Food"
      necessityScore = lowerDesc.includes('grocery') ? 8 : 4
    } else if (lowerDesc.includes('gas') || lowerDesc.includes('uber') || lowerDesc.includes('transport')) {
      category = "Transportation"
      necessityScore = 7
    } else if (lowerDesc.includes('movie') || lowerDesc.includes('entertainment') || lowerDesc.includes('game')) {
      category = "Entertainment"
      necessityScore = 2
    } else if (lowerDesc.includes('rent') || lowerDesc.includes('utility') || lowerDesc.includes('phone')) {
      category = "Bills"
      necessityScore = 9
    }

    return {
      category,
      necessityScore,
      confidence: 0.7
    }
  }

  private fallbackCategorization(description: string, amount: number) {
    return this.parseCategorization("", description, amount)
  }
}

export const aiCoach = new AIFinancialCoach()