import React from 'react'
import {
  TrendingUp,
  DollarSign,
  Layers,
  Award,
} from 'lucide-react'
import ExpenseCharts from './ExpenseCharts'
import {
  formatCurrency,
  calculateMonthlyCost,
} from '../utils/calculations'

export default function AnalyticsView({
  subscriptions = [],
  categoryData = [],
  currency = '$',
}) {
  const activeSubs = subscriptions.filter((s) => s.status === 'active')

  // Total spend
  const totalMonthly = activeSubs.reduce((sum, s) => sum + calculateMonthlyCost(s), 0)

  // Monthly vs yearly billing breakdown
  const monthlyBillingSubs = activeSubs.filter((s) => s.billingCycle === 'monthly')
  const yearlyBillingSubs = activeSubs.filter((s) => s.billingCycle === 'yearly')

  const monthlyCycleSpend = monthlyBillingSubs.reduce((sum, s) => sum + calculateMonthlyCost(s), 0)
  const yearlyCycleSpend = yearlyBillingSubs.reduce((sum, s) => sum + calculateMonthlyCost(s), 0)

  // Average cost per active subscription
  const avgMonthly = activeSubs.length > 0 ? totalMonthly / activeSubs.length : 0

  // Highest and lowest expense
  const sortedSubs = [...activeSubs].sort(
    (a, b) => calculateMonthlyCost(b) - calculateMonthlyCost(a)
  )
  const highestSub = sortedSubs[0] || null

  // Efficiency audit score: proportion of regularly utilized subscriptions
  const utilizedCount = activeSubs.filter(
    (s) => s.usageFrequency !== 'rarely' && s.usageFrequency !== 'never'
  ).length
  const efficiencyScore =
    activeSubs.length > 0 ? Math.round((utilizedCount / activeSubs.length) * 100) : 100

  return (
    <div className="space-y-6">
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Efficiency Score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Optimization Score
            </span>
            <Award
              className={`w-4 h-4 ${
                efficiencyScore >= 80 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{efficiencyScore}%</span>
            <span className="text-xs text-slate-500">
              ({utilizedCount}/{activeSubs.length} optimized)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                efficiencyScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${efficiencyScore}%` }}
            />
          </div>
        </div>

        {/* Average cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Plan Cost
            </span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(avgMonthly, currency)}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Across {activeSubs.length} active subscriptions
          </span>
        </div>

        {/* Highest individual expense */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Highest Expense
            </span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 truncate">
            {highestSub ? formatCurrency(calculateMonthlyCost(highestSub), currency) : '$0'}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block truncate">
            {highestSub ? highestSub.name : 'None'}
          </span>
        </div>

        {/* Billing cycle distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cycle Split
            </span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xs font-medium text-slate-700 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Monthly billing:</span>
              <strong className="text-slate-900">
                {monthlyBillingSubs.length} ({formatCurrency(monthlyCycleSpend, currency)}/mo)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Annual billing:</span>
              <strong className="text-slate-900">
                {yearlyBillingSubs.length} ({formatCurrency(yearlyCycleSpend, currency)}/mo)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Expense Chart Breakdown */}
      <ExpenseCharts
        categoryData={categoryData}
        subscriptions={subscriptions}
        currency={currency}
      />
    </div>
  )
}
