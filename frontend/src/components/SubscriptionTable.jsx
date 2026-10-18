import React, { useState, useMemo } from 'react'
import {
  Filter,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react'
import {
  calculateMonthlyCost,
  formatCurrency,
  formatDate,
  getRenewalBadgeInfo,
} from '../utils/calculations'
import { CATEGORIES, STATUS_OPTIONS, USAGE_FREQUENCIES } from '../utils/mockData'

export default function SubscriptionTable({
  subscriptions = [],
  onViewSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onOpenAddModal,
  searchQuery = '',
  setSearchQuery,
  initialCategoryFilter = 'all',
}) {
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter)
  const [statusFilter, setStatusFilter] = useState('all')
  const [cycleFilter, setCycleFilter] = useState('all')
  const [usageFilter, setUsageFilter] = useState('all')
  const [sortBy, setSortBy] = useState('renewal_asc')

  // Filter & sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search query match (name, notes, category, payment method)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const nameMatch = sub.name?.toLowerCase().includes(q)
          const catMatch = sub.category?.toLowerCase().includes(q)
          const notesMatch = sub.notes?.toLowerCase().includes(q)
          const payMatch = sub.paymentMethod?.toLowerCase().includes(q)
          if (!nameMatch && !catMatch && !notesMatch && !payMatch) return false
        }

        // Category filter
        if (categoryFilter !== 'all' && sub.category !== categoryFilter) {
          return false
        }

        // Status filter
        if (statusFilter !== 'all' && sub.status !== statusFilter) {
          return false
        }

        // Billing cycle filter
        if (cycleFilter !== 'all' && sub.billingCycle !== cycleFilter) {
          return false
        }

        // Usage filter
        if (usageFilter === 'underutilized') {
          if (sub.usageFrequency !== 'rarely' && sub.usageFrequency !== 'never') return false
        } else if (usageFilter === 'regular') {
          if (sub.usageFrequency === 'rarely' || sub.usageFrequency === 'never') return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'renewal_asc') {
          return new Date(a.nextRenewalDate) - new Date(b.nextRenewalDate)
        }
        if (sortBy === 'renewal_desc') {
          return new Date(b.nextRenewalDate) - new Date(a.nextRenewalDate)
        }
        if (sortBy === 'cost_desc') {
          return calculateMonthlyCost(b) - calculateMonthlyCost(a)
        }
        if (sortBy === 'cost_asc') {
          return calculateMonthlyCost(a) - calculateMonthlyCost(b)
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name)
        }
        return 0
      })
  }, [subscriptions, searchQuery, categoryFilter, statusFilter, cycleFilter, usageFilter, sortBy])

  // Total monthly cost of visible filtered items
  const filteredMonthlyTotal = useMemo(() => {
    return filteredSubscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + calculateMonthlyCost(s), 0)
  }, [filteredSubscriptions])

  // Helper for category badge styling
  const getCategoryColor = (cat) => {
    const map = {
      'Streaming & Media': 'bg-purple-50 text-purple-700 border-purple-200',
      Productivity: 'bg-blue-50 text-blue-700 border-blue-200',
      'Developer Tools': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Cloud Storage': 'bg-sky-50 text-sky-700 border-sky-200',
      'Cloud & Hosting': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'AI Tools': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Health & Fitness': 'bg-rose-50 text-rose-700 border-rose-200',
      'Music & Audio': 'bg-pink-50 text-pink-700 border-pink-200',
      Utilities: 'bg-amber-50 text-amber-700 border-amber-200',
    }
    return map[cat] || 'bg-slate-50 text-slate-700 border-slate-200'
  }

  // Generates 2-letter initials for service badge
  const getInitials = (name) => {
    if (!name) return 'S'
    const parts = name.trim().split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const resetAllFilters = () => {
    if (setSearchQuery) setSearchQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setCycleFilter('all')
    setUsageFilter('all')
    setSortBy('renewal_asc')
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Action & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Subscription Portfolio</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredSubscriptions.length} of {subscriptions.length} recurring services
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                aria-label="Sort subscriptions"
              >
                <option value="renewal_asc">Renewal Date (Earliest)</option>
                <option value="renewal_desc">Renewal Date (Latest)</option>
                <option value="cost_desc">Cost (High to Low)</option>
                <option value="cost_asc">Cost (Low to High)</option>
                <option value="name_asc">Service Name (A-Z)</option>
              </select>
            </div>

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-500">Filter:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500"
            aria-label="Filter by Category"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Billing Cycle Filter */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500"
            aria-label="Filter by Billing Cycle"
          >
            <option value="all">All Cycles</option>
            <option value="monthly">Monthly only</option>
            <option value="yearly">Yearly only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500"
            aria-label="Filter by Status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Usage Filter */}
          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-hidden focus:border-indigo-500"
            aria-label="Filter by Usage"
          >
            <option value="all">All Usages</option>
            <option value="underutilized">⚠️ Rarely or Never Used</option>
            <option value="regular">Daily / Weekly Regular</option>
          </select>

          {/* Reset Filters CTA if any filter is active */}
          {(categoryFilter !== 'all' ||
            statusFilter !== 'all' ||
            cycleFilter !== 'all' ||
            usageFilter !== 'all' ||
            (searchQuery && searchQuery.trim() !== '')) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 sm:px-6">Service</th>
              <th scope="col" className="py-3 px-4">Category</th>
              <th scope="col" className="py-3 px-4">Billing & Price</th>
              <th scope="col" className="py-3 px-4">Next Renewal</th>
              <th scope="col" className="py-3 px-4">Usage</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredSubscriptions.map((sub) => {
              const monthlyCost = calculateMonthlyCost(sub)
              const badge = getRenewalBadgeInfo(sub.nextRenewalDate)
              const usageConfig = USAGE_FREQUENCIES.find((u) => u.value === sub.usageFrequency) || {
                label: sub.usageFrequency || 'Regular',
                badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
              }
              const statusConfig = STATUS_OPTIONS.find((s) => s.value === sub.status) || {
                label: sub.status || 'Active',
                badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
              }

              return (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Service Info */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(sub.name)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {sub.paymentMethod || 'Default card'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${getCategoryColor(
                        sub.category
                      )}`}
                    >
                      {sub.category}
                    </span>
                  </td>

                  {/* Price & Cycle (with monthly normalized equivalent) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(sub.price, sub.currency || '$')}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        /{sub.billingCycle === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    </div>
                    {sub.billingCycle === 'yearly' && (
                      <span className="text-[11px] text-slate-500 font-medium block">
                        ≈ {formatCurrency(monthlyCost, sub.currency || '$')}/mo
                      </span>
                    )}
                  </td>

                  {/* Next Renewal Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">
                      {formatDate(sub.nextRenewalDate)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                        badge.variant === 'danger'
                          ? 'bg-rose-100 text-rose-800'
                          : badge.variant === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : badge.variant === 'info'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {badge.text}
                    </span>
                  </td>

                  {/* Usage Frequency */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${usageConfig.badgeColor}`}
                    >
                      {usageConfig.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig.badgeColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewSubscription(sub)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="View details"
                        aria-label={`View ${sub.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditSubscription(sub)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit subscription"
                        aria-label={`Edit ${sub.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSubscription(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete subscription"
                        aria-label={`Delete ${sub.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Empty State */}
            {filteredSubscriptions.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        No subscriptions matched your filters
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Try resetting your search query or loosening your category and status filters.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      {filteredSubscriptions.length > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{filteredSubscriptions.length}</strong> items
          </span>
          <div>
            Filtered active recurring total:{' '}
            <strong className="text-slate-900 font-semibold">
              {formatCurrency(filteredMonthlyTotal)}/mo
            </strong>{' '}
            ({formatCurrency(filteredMonthlyTotal * 12)}/yr)
          </div>
        </div>
      )}
    </div>
  )
}
