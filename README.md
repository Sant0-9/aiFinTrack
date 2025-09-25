# AIFin - AI-Powered Finance Tracker

A modern, intelligent finance tracker with AI coaching that helps prevent overspending and achieve savings goals.

## 🌟 Features

### 🤖 AI Financial Coach
- **Pre-purchase consultation**: Ask "Should I buy this?" before making purchases
- **Personalized advice**: Context-aware recommendations based on your financial situation
- **Smart categorization**: Automatic transaction categorization with necessity scoring
- **Spending pattern analysis**: AI identifies trends and provides insights

### 📊 Real-time Budget Tracking
- **Live spending monitoring**: Track daily, weekly, and monthly expenses
- **Visual progress indicators**: See budget usage with color-coded alerts
- **Category-wise budgeting**: Set and monitor budgets for different spending categories
- **Goal progress tracking**: Monitor savings goals with milestone celebrations

### 🚨 Intelligent Alerts & Prevention
- **Progressive warnings**: Gentle reminders → firm warnings → emergency stops
- **Context-aware notifications**: Alerts consider time, location, and spending patterns
- **Achievement celebrations**: Motivational messages for staying on track
- **Overspending prevention**: Real-time intervention before budget exceeded

### 💬 Conversational AI Interface
- **Natural language queries**: Chat with your AI financial coach
- **Personalized responses**: AI remembers your financial history and goals
- **Financial education**: Bite-sized tips and strategies for better money management
- **24/7 availability**: Get advice whenever you need it

### 📱 Modern User Experience
- **Mobile-first design**: Beautiful, responsive interface for all devices
- **Progressive Web App**: Install on mobile devices for native-like experience
- **Touch-optimized**: Smooth gestures and interactions
- **Dark/light mode**: Adaptive interface (coming soon)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Vercel Postgres with Prisma ORM
- **Authentication**: NextAuth.js (Google, GitHub)
- **AI**: OpenAI GPT-3.5 for financial coaching
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Vercel Postgres)
- OpenAI API key
- OAuth provider credentials (Google, GitHub)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd aifin
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard page
│   ├── consult/          # AI consultation interface
│   ├── chat/             # AI chat interface
│   └── auth/             # Authentication pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Dashboard/        # Dashboard-specific components
│   ├── AI/              # AI-related components
│   └── providers/        # Context providers
├── lib/                  # Utility functions and configurations
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client setup
│   ├── openai.ts        # OpenAI service layer
│   └── utils.ts         # Helper functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🎯 Key Features Implementation

### AI Financial Coach System

The AI system provides intelligent financial guidance through:

- **Context-aware prompting**: Incorporates user's financial data, spending patterns, and goals
- **Multi-turn conversations**: Maintains context across chat sessions
- **Personalized advice**: Adapts to user's income, goals, and risk tolerance
- **Behavioral analysis**: Identifies spending triggers and patterns

### Real-time Prevention System

Smart intervention system that:

- **Analyzes purchase necessity**: Evaluates each transaction against budget and goals
- **Provides alternatives**: Suggests cheaper options or delay tactics
- **Escalates warnings**: Progressive alerts based on spending velocity
- **Celebrates achievements**: Motivational feedback for good financial behavior

### Dashboard Analytics

Comprehensive financial overview with:

- **Real-time calculations**: Live budget tracking and goal progress
- **Visual indicators**: Progress bars, charts, and color-coded alerts
- **Trend analysis**: Spending patterns and predictions
- **Goal tracking**: Visual progress toward savings objectives

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Import your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Database Setup**
   - Use Vercel Postgres or your preferred PostgreSQL provider
   - Run migrations: `npx prisma db push`

3. **Deploy**
   - Vercel automatically deploys on git push
   - Production URL will be provided

### Manual Deployment

```bash
npm run build
npm start
```

## 📱 Progressive Web App

The application is PWA-ready with:

- **Service worker**: Offline functionality (coming soon)
- **App manifest**: Install prompts on mobile devices
- **Responsive design**: Works seamlessly across all devices
- **Touch optimizations**: Native-like mobile experience

## 🔐 Security & Privacy

- **Data encryption**: All financial data encrypted at rest
- **Secure authentication**: OAuth providers with session management
- **API protection**: Rate limiting and input validation
- **Privacy first**: No data sharing with third parties

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Vercel for hosting and database services
- The open-source community for the amazing tools and libraries

---

**Built with ❤️ using Next.js 14, OpenAI, and modern web technologies.**