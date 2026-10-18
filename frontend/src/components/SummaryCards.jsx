import React from 'react'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CalendarClock,
} from 'lucide-react'
import { formatCurrency } from '../utils/calculations'

export default function SummaryCards({
  totalMonthly = 0,
  totalAnnual = 0,
  activeCount = 0,
  pausedCount = 0,
  totalCount = 0,
  upcomingRenewalsCount = 0,
  upcomingRenewalsCost = 0,
  currency = '$',
  onSelectTab,
}) {
  const cards = [
    {
      id: 'monthly',
      title: 'Monthly Recurring Expenses',
      value: formatCurrency(totalMonthly, currency),
      subtext: `Projected ${formatCurrency(totalAnnual, currency)}/year`,
      icon: DollarSign,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      badge: 'Active commitments',
      onClick: () => onSelectTab && onSelectTab('subscriptions'),
    },
    {
      id: 'annual',
      title: 'Annual Projected Expenses',
      value: formatCurrency(totalAnnual, currency),
      subtext: `Averages ${formatCurrency(totalMonthly, currency)}/mo`,
      icon: TrendingUp,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      badge: '12-month outlook',
      onClick: () => onSelectTab && onSelectTab('analytics'),
    },
    {
      id: 'active',
      title: 'Active Subscriptions',
      value: `${activeCount}`,
      subtext: `${pausedCount} paused • ${totalCount} total tracked`,
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badge: activeCount > 0 ? 'Operational' : 'No active subs',
      onClick: () => onSelectTab && onSelectTab('subscriptions'),
    },
    {
      id: 'renewals',
      title: 'Upcoming Renewals (7 Days)',
      value: `${upcomingRenewalsCount}`,
      subtext:
        upcomingRenewalsCount > 0
          ? `${formatCurrency(upcomingRenewalsCost, currency)} due this week`
          : 'No renewals due this week',
      icon: CalendarClock,
      iconBg:
        upcomingRenewalsCount > 0
          ? 'bg-amber-50 text-amber-600 border border-amber-100'
          : 'bg-slate-50 text-slate-600 border border-slate-100',
      badge: upcomingRenewalsCount > 0 ? 'Action suggested' : 'Up to date',
      badgeAlert: upcomingRenewalsCount > 0,
      onClick: () => onSelectTab && onSelectTab('renewals'),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium truncate max-w-[170px]">
                {card.subtext}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  card.badgeAlert
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700'
                } transition-colors`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
