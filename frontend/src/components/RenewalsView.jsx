import React from 'react'
import {
  CalendarClock,
  Calendar,
  DollarSign,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import {
  calculateDaysUntil,
  formatCurrency,
  getRenewalBadgeInfo,
} from '../utils/calculations'

export default function RenewalsView({
  subscriptions = [],
  onViewSubscription,
  currency = '$',
}) {
  const activeSubs = subscriptions.filter((s) => s.status === 'active')

  // Buckets
  const urgent7Days = activeSubs
    .filter((s) => {
      const d = calculateDaysUntil(s.nextRenewalDate)
      return d >= 0 && d <= 7
    })
    .sort((a, b) => calculateDaysUntil(a.nextRenewalDate) - calculateDaysUntil(b.nextRenewalDate))

  const next14Days = activeSubs
    .filter((s) => {
      const d = calculateDaysUntil(s.nextRenewalDate)
      return d > 7 && d <= 14
    })
    .sort((a, b) => calculateDaysUntil(a.nextRenewalDate) - calculateDaysUntil(b.nextRenewalDate))

  const next30Days = activeSubs
    .filter((s) => {
      const d = calculateDaysUntil(s.nextRenewalDate)
      return d > 14 && d <= 30
    })
    .sort((a, b) => calculateDaysUntil(a.nextRenewalDate) - calculateDaysUntil(b.nextRenewalDate))

  const overdue = activeSubs.filter((s) => calculateDaysUntil(s.nextRenewalDate) < 0)

  const cost7Days = urgent7Days.reduce((sum, s) => sum + s.price, 0)
  const cost14Days = next14Days.reduce((sum, s) => sum + s.price, 0)
  const cost30Days = next30Days.reduce((sum, s) => sum + s.price, 0)

  const renderRenewalCard = (sub) => {
    const badge = getRenewalBadgeInfo(sub.nextRenewalDate)

    return (
      <div
        key={sub.id}
        onClick={() => onViewSubscription(sub)}
        className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 border border-slate-200 text-slate-800 group-hover:text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
            {sub.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
              {sub.name}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {sub.category} • {sub.paymentMethod || 'Default Card'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-bold text-sm text-slate-900 block">
              {formatCurrency(sub.price, sub.currency || currency)}
            </span>
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                badge.variant === 'danger'
                  ? 'bg-rose-100 text-rose-800'
                  : badge.variant === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {badge.text}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Immediate (0 - 7 Days)
            </span>
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(cost7Days, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {urgent7Days.length} service{urgent7Days.length === 1 ? '' : 's'} billing this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
              Next 2 Weeks (8 - 14 Days)
            </span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(cost14Days, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {next14Days.length} service{next14Days.length === 1 ? '' : 's'} scheduled
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              30-Day Total Cash Outlay
            </span>
            <DollarSign className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(cost7Days + cost14Days + cost30Days, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {urgent7Days.length + next14Days.length + next30Days.length} payments due in 30 days
          </span>
        </div>
      </div>

      {/* Overdue alert if any */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue Renewal Dates ({overdue.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdue.map(renderRenewalCard)}
          </div>
        </div>
      )}

      {/* Urgent 7-day Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Due Within 7 Days ({urgent7Days.length})</span>
          </h3>
          <span className="text-xs font-semibold text-slate-600">
            Subtotal: {formatCurrency(cost7Days, currency)}
          </span>
        </div>
        {urgent7Days.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgent7Days.map(renderRenewalCard)}
          </div>
        ) : (
          <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-200 text-center">
            No renewals due within the next 7 days.
          </p>
        )}
      </div>

      {/* 8-14 Days Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Due in 8 to 14 Days ({next14Days.length})</span>
          </h3>
          <span className="text-xs font-semibold text-slate-600">
            Subtotal: {formatCurrency(cost14Days, currency)}
          </span>
        </div>
        {next14Days.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {next14Days.map(renderRenewalCard)}
          </div>
        ) : (
          <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-200 text-center">
            No renewals due in this window.
          </p>
        )}
      </div>

      {/* 15-30 Days Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Due in 15 to 30 Days ({next30Days.length})</span>
          </h3>
          <span className="text-xs font-semibold text-slate-600">
            Subtotal: {formatCurrency(cost30Days, currency)}
          </span>
        </div>
        {next30Days.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {next30Days.map(renderRenewalCard)}
          </div>
        ) : (
          <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-200 text-center">
            No renewals in this period.
          </p>
        )}
      </div>
    </div>
  )
}
