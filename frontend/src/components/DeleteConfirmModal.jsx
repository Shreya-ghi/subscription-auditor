import React from 'react'
import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils/calculations'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  subscription,
}) {
  if (!isOpen || !subscription) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Subscription?</h3>
            <p className="text-xs text-slate-500">
              This action removes the service from your recurring audit dashboard.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 text-xs text-slate-700 space-y-1">
          <p>
            Service: <strong className="text-slate-900">{subscription.name}</strong>
          </p>
          <p>
            Rate:{' '}
            <strong className="text-slate-900">
              {formatCurrency(subscription.price, subscription.currency)} / {subscription.billingCycle}
            </strong>
          </p>
          <p>
            Category: <strong className="text-slate-900">{subscription.category}</strong>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(subscription.id)
              onClose()
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors"
          >
            Yes, Delete Subscription
          </button>
        </div>
      </div>
    </div>
  )
}
