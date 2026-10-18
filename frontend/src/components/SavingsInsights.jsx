import React from 'react'
import { Sparkles } from 'lucide-react'
import { formatCurrency, calculateMonthlyCost, calculateAnnualCost } from '../utils/calculations'

export default function SavingsInsights({
  savingsInsights = {},
  onViewSubscription,
  currency = '$',
}) {
  const {
    underutilizedSubscriptions = [],
    totalMonthlyWaste = 0,
    totalAnnualWaste = 0,
    totalCount = 0,
  } = savingsInsights

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Optimization Audit: 100% Efficient</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All active subscriptions are marked as regularly utilized. No inactive or forgotten
              subscriptions detected!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-emerald-200/90 shadow-xs p-5 relative overflow-hidden">
      {/* Decorative subtle background aura */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Savings Insights & Usage Audit ({totalCount} Opportunities)
            </h3>
            <p className="text-xs text-slate-500">
              Subscriptions marked rarely or never used represent recurring waste ({formatCurrency(totalMonthlyWaste, currency)}/mo).
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-left sm:text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            Annual Waste Recoverable
          </span>
          <span className="text-base font-bold text-emerald-700">
            {formatCurrency(totalAnnualWaste, currency)}
            <span className="text-xs font-medium text-emerald-600">/yr</span>
          </span>
        </div>
      </div>

      {/* Recommendation Items */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {underutilizedSubscriptions.map((sub) => {
          const isNever = sub.usageFrequency === 'never'
          const annualWaste = calculateAnnualCost(sub)
          const monthlyWaste = calculateMonthlyCost(sub)

          return (
            <div
              key={sub.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{sub.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isNever
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isNever ? 'Never Used' : 'Rarely Used'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  Paying <strong className="text-slate-900">{formatCurrency(monthlyWaste, currency)}/mo</strong>{' '}
                  ({formatCurrency(annualWaste, currency)}/year). {sub.notes || 'No active use logged.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Save {formatCurrency(annualWaste, currency)}/yr if paused
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onViewSubscription && onViewSubscription(sub)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
