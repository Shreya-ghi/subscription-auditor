import React from 'react'
import {
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, calculateMonthlyCost } from '../utils/calculations'

export default function DuplicateWarnings({
  warnings = [],
  onFilterCategory,
  onViewSubscription,
  currency = '$',
}) {
  if (!warnings || warnings.length === 0) {
    return null
  }

  const totalPotentialSavings = warnings.reduce(
    (sum, w) => sum + (w.potentialAnnualSavings || 0),
    0
  )

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-500/10 border border-amber-200/90 rounded-xl p-5 shadow-xs">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-amber-200/60 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Potential Duplicate Subscriptions ({warnings.length} Detected)
            </h3>
            <p className="text-xs text-amber-800">
              Multiple overlapping services detected in the same category or with identical functionality.
            </p>
          </div>
        </div>

        {totalPotentialSavings > 0 && (
          <div className="bg-amber-100/80 px-3 py-1 rounded-lg text-right border border-amber-300/60">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              Consolidation Opportunity
            </span>
            <span className="text-xs font-bold text-amber-950">
              Save up to {formatCurrency(totalPotentialSavings, currency)}/yr
            </span>
          </div>
        )}
      </div>

      {/* Warning Cards List */}
      <div className="mt-4 space-y-3">
        {warnings.map((warn) => (
          <div
            key={warn.id}
            className="bg-white/90 p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{warn.title}</span>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {warn.category}
                </span>
              </div>
              <p className="text-xs text-slate-600">{warn.message}</p>

              {/* Subscriptions in this duplicate group */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {warn.subscriptions.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onViewSubscription && onViewSubscription(sub)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium rounded-md transition-colors"
                  >
                    <span>{sub.name}</span>
                    <span className="text-slate-500 font-normal">
                      ({formatCurrency(calculateMonthlyCost(sub), sub.currency)}/mo)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Savings & Action CTA */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">
                  Potential Savings
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  +{formatCurrency(warn.potentialAnnualSavings, currency)}/yr
                </span>
              </div>

              <button
                type="button"
                onClick={() => onFilterCategory && onFilterCategory(warn.category)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
              >
                <span>Audit {warn.category}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
