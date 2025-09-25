'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    type: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className
}: StatsCardProps) {
  return (
    <div className={cn('card', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center">
          <div className={cn(
            'flex items-center text-sm',
            trend.type === 'positive' ? 'text-green-600' :
            trend.type === 'negative' ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend.type === 'positive' ? '↗' : trend.type === 'negative' ? '↘' : '→'}
            <span className="ml-1 font-medium">{Math.abs(trend.value)}%</span>
          </div>
          <span className="ml-2 text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}