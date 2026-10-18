import React from 'react'
import {
  CalendarClock,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  getRenewalBadgeInfo,
} from '../utils/calculations'

export default function UpcomingRenewals({
  renewals = [],
  onViewSubscription,
  onSelectTab,
  currency = '$',
}) {
  const totalDueSoon = renewals.reduce((sum, r) => sum + r.price, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming Renewals (7 Days)</h3>
            <p className="text-[11px] text-slate-500">
              Immediate cash flow commitments due within the week
            </p>
          </div>
        </div>

        {renewals.length > 0 && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Total Due Soon
            </span>
            <span className="text-xs font-bold text-slate-900">
              {formatCurrency(totalDueSoon, currency)}
            </span>
          </div>
        )}
      </div>

      {/* Renewals List */}
      <div className="mt-3.5 divide-y divide-slate-100">
        {renewals.map((item) => {
          const badge = getRenewalBadgeInfo(item.nextRenewalDate)

          return (
            <div
              key={item.id}
              onClick={() => onViewSubscription && onViewSubscription(item)}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 border border-slate-200 text-slate-700 group-hover:text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {formatDate(item.nextRenewalDate)} • {item.paymentMethod || 'Default card'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="font-bold text-xs text-slate-900 block">
                    {formatCurrency(item.price, item.currency || currency)}
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
        })}

        {renewals.length === 0 && (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">No renewals due in the next 7 days</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Your subscriptions are comfortably scheduled for later dates.
            </p>
          </div>
        )}
      </div>

      {renewals.length > 0 && onSelectTab && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onSelectTab('renewals')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View complete 30-day renewal timeline →
          </button>
        </div>
      )}
    </div>
  )
}
