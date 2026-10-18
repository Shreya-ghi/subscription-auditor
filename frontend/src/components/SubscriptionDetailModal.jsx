import React from 'react'
import {
  X,
  AlertTriangle,
  Sparkles,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import {
  calculateMonthlyCost,
  calculateAnnualCost,
  formatCurrency,
  formatDate,
  getRenewalBadgeInfo,
} from '../utils/calculations'
import { USAGE_FREQUENCIES, STATUS_OPTIONS } from '../utils/mockData'

export default function SubscriptionDetailModal({
  isOpen,
  onClose,
  subscription,
  onEdit,
  onDelete,
  allSubscriptions = [],
}) {
  if (!isOpen || !subscription) return null

  const monthlyCost = calculateMonthlyCost(subscription)
  const annualCost = calculateAnnualCost(subscription)
  const badgeInfo = getRenewalBadgeInfo(subscription.nextRenewalDate)

  // Find if there are other subscriptions in the same category
  const sameCategorySubs = allSubscriptions.filter(
    (s) => s.id !== subscription.id && s.category === subscription.category && s.status === 'active'
  )

  const isUnderutilized =
    subscription.usageFrequency === 'rarely' || subscription.usageFrequency === 'never'

  const usageConfig = USAGE_FREQUENCIES.find((u) => u.value === subscription.usageFrequency) || {
    label: subscription.usageFrequency,
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  }

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === subscription.status) || {
    label: subscription.status,
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {subscription.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{subscription.name}</h3>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badgeColor}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{subscription.category}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                Billing Rate
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {formatCurrency(subscription.price, subscription.currency)}
                <span className="text-xs font-normal text-slate-500">
                  /{subscription.billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {subscription.billingCycle === 'yearly'
                  ? `Normalized to ${formatCurrency(monthlyCost, subscription.currency)}/mo`
                  : `Projects to ${formatCurrency(annualCost, subscription.currency)}/yr`}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                Next Renewal
              </span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {formatDate(subscription.nextRenewalDate)}
              </div>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  badgeInfo.variant === 'danger'
                    ? 'bg-rose-100 text-rose-800'
                    : badgeInfo.variant === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {badgeInfo.text}
              </span>
            </div>
          </div>

          {/* Auditor Insights & Intelligence Check */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 block">
              Auditor Intelligence Summary
            </span>

            {/* Underutilized warning */}
            {isUnderutilized && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-semibold">Underutilized Subscription:</span> Marked as{' '}
                  <span className="font-semibold">{usageConfig.label}</span>. You could save{' '}
                  <span className="font-bold">{formatCurrency(annualCost, subscription.currency)}</span> per
                  year by pausing or cancelling this service.
                </div>
              </div>
            )}

            {/* Overlap duplicate warning */}
            {sameCategorySubs.length > 0 && (
              <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <span className="font-semibold">Category Overlap:</span> You have{' '}
                  {sameCategorySubs.length} other active subscription
                  {sameCategorySubs.length === 1 ? '' : 's'} in{' '}
                  <span className="font-semibold">{subscription.category}</span> (
                  {sameCategorySubs.map((s) => s.name).join(', ')}).
                </div>
              </div>
            )}

            {!isUnderutilized && sameCategorySubs.length === 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Healthy subscription. No duplicate overlap or usage flags.</span>
              </div>
            )}
          </div>

          {/* Details list */}
          <div className="bg-slate-50/60 rounded-xl border border-slate-200/60 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500">Usage Frequency</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${usageConfig.badgeColor}`}>
                {usageConfig.label}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500">Payment Method</span>
              <span className="text-slate-800 font-medium">{subscription.paymentMethod || 'None specified'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500">Cycle Format</span>
              <span className="text-slate-800 font-medium capitalize">{subscription.billingCycle}</span>
            </div>
            {subscription.notes && (
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Notes:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/60">
                  {subscription.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose()
              onDelete(subscription)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(subscription)
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
