import React, { useState } from 'react'
import {
  X,
  AlertCircle,
  Check,
} from 'lucide-react'
import { CATEGORIES, STATUS_OPTIONS, USAGE_FREQUENCIES, PAYMENT_METHODS } from '../utils/mockData'
import { formatCurrency } from '../utils/calculations'

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  subscription = null, // if provided, edit mode; if null, add mode
}) {
  const isEditMode = Boolean(subscription)

  // Initialize form state
  const getInitialForm = () => {
    if (subscription) {
      const priceVal = subscription.price !== undefined ? subscription.price : subscription.amount
      return {
        name: subscription.name || '',
        category: subscription.category || CATEGORIES[0],
        price: priceVal !== undefined && priceVal !== null ? String(priceVal) : '',
        currency: subscription.currency || '$',
        billingCycle: (subscription.billingCycle || subscription.billing_cycle || 'monthly').toLowerCase(),
        nextRenewalDate: subscription.nextRenewalDate || subscription.next_renewal || '',
        status: subscription.status || 'active',
        usageFrequency: subscription.usageFrequency || 'daily',
        paymentMethod: subscription.paymentMethod || PAYMENT_METHODS[0],
        notes: subscription.notes || '',
      }
    }
    const today = new Date()
    today.setMonth(today.getMonth() + 1)
    return {
      name: '',
      category: CATEGORIES[0],
      price: '',
      currency: '$',
      billingCycle: 'monthly',
      nextRenewalDate: today.toISOString().split('T')[0],
      status: 'active',
      usageFrequency: 'daily',
      paymentMethod: PAYMENT_METHODS[0],
      notes: '',
    }
  }

  const [formData, setFormData] = useState(getInitialForm)
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  // Validate form
  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) {
      errs.name = 'Service name is required'
    }

    if (!formData.price || formData.price.trim() === '') {
      errs.price = 'Price is required'
    } else {
      const num = parseFloat(formData.price)
      if (isNaN(num) || num <= 0) {
        errs.price = 'Price must be a positive number greater than 0'
      }
    }

    if (!formData.nextRenewalDate) {
      errs.nextRenewalDate = 'Next renewal date is required'
    }

    return errs
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const priceNum = parseFloat(formData.price)
    const payload = {
      ...formData,
      price: priceNum,
      amount: priceNum,
      id: subscription ? subscription.id : undefined,
    }

    onSave(payload)
    onClose()
  }

  // Calculate live cost previews
  const parsedPrice = parseFloat(formData.price) || 0
  const previewMonthly =
    formData.billingCycle === 'yearly' ? parsedPrice / 12 : parsedPrice
  const previewAnnual =
    formData.billingCycle === 'monthly' ? parsedPrice * 12 : parsedPrice

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 id="modal-title" className="text-base font-bold text-slate-900">
              {isEditMode ? 'Edit Subscription' : 'Add New Subscription'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? 'Update billing details, usage audit status, or notes.'
                : 'Track a recurring service to audit costs and renewal schedule.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Netflix, GitHub Copilot, AWS, Spotify"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-300 focus:border-indigo-600'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Category & Billing Cycle Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Billing Cycle <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('billingCycle', 'monthly')}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    formData.billingCycle === 'monthly'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('billingCycle', 'yearly')}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    formData.billingCycle === 'yearly'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  {formData.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.price
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="₹">INR (₹)</option>
                <option value="¥">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Live Calculated Normalized Cost Preview Box */}
          {parsedPrice > 0 && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">
                  {formData.billingCycle === 'yearly' ? 'Normalized Monthly:' : 'Annualized Cost:'}
                </span>{' '}
                {formData.billingCycle === 'yearly'
                  ? `${formatCurrency(previewMonthly, formData.currency)}/mo`
                  : `${formatCurrency(previewAnnual, formData.currency)}/yr`}
              </div>
              <div className="text-[11px] text-indigo-700 font-medium">
                Calculated automatically
              </div>
            </div>
          )}

          {/* Next Renewal Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Next Renewal Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.nextRenewalDate}
                onChange={(e) => handleChange('nextRenewalDate', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.nextRenewalDate
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
              {errors.nextRenewalDate && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nextRenewalDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subscription Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Usage Frequency & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usage Frequency (Auditor Insight)
              </label>
              <select
                value={formData.usageFrequency}
                onChange={(e) => handleChange('usageFrequency', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {USAGE_FREQUENCIES.map((uf) => (
                  <option key={uf.value} value={uf.value}>
                    {uf.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                placeholder="e.g. Visa •••• 4242, PayPal"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes & Description (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="e.g. Family plan, cancel if not used by next quarter, billing login"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Save Changes' : 'Create Subscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
