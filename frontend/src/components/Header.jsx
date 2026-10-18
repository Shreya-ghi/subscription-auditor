import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  Plus,
  Menu,
  CalendarClock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

export default function Header({
  activeTab,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  setMobileOpen,
  upcomingRenewals = [],
  duplicateWarnings = [],
  savingsInsights = {},
  onSelectTab,
}) {
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const titles = {
    overview: {
      title: 'Subscription Dashboard',
      subtitle: 'Monitor recurring expenses, renewal timelines, and audit savings opportunities.',
    },
    subscriptions: {
      title: 'My Subscriptions',
      subtitle: 'Manage active subscriptions, pricing plans, and billing schedules.',
    },
    renewals: {
      title: 'Upcoming Renewals',
      subtitle: 'Track payment schedules and upcoming cash flow commitments.',
    },
    analytics: {
      title: 'Expense Analytics',
      subtitle: 'Categorical cost distribution and annual spend projections.',
    },
    settings: {
      title: 'Preferences & System',
      subtitle: 'Currency formats, reminder thresholds, and local storage data management.',
    },
  }

  const currentInfo = titles[activeTab] || titles.overview

  const totalAlerts =
    upcomingRenewals.length +
    duplicateWarnings.length +
    (savingsInsights.totalCount > 0 ? 1 : 0)

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left section: Hamburger button & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {currentInfo.title}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right section: Search, Notifications, Add CTA, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscriptions..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                aria-label="Search subscriptions"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg border transition-colors ${
                  showNotifications
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                aria-label="Audit notifications"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Notifications & Audit Alerts
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {totalAlerts} active item{totalAlerts === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {/* Upcoming renewals alert */}
                    {upcomingRenewals.length > 0 && (
                      <div className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md shrink-0 mt-0.5">
                            <CalendarClock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              {upcomingRenewals.length} Renewal{upcomingRenewals.length === 1 ? '' : 's'} Due Soon
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {upcomingRenewals.map((r) => r.name).join(', ')} renewing within the next 7 days.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNotifications(false)
                                if (onSelectTab) onSelectTab('renewals')
                              }}
                              className="text-[11px] font-medium text-indigo-600 hover:underline mt-1 inline-block"
                            >
                              View renewal schedule →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Duplicate alerts */}
                    {duplicateWarnings.length > 0 && (
                      <div className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              {duplicateWarnings.length} Potential Redundanc{duplicateWarnings.length === 1 ? 'y' : 'ies'}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {duplicateWarnings[0].title}. Potential annual savings of $
                              {duplicateWarnings[0].potentialAnnualSavings}.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNotifications(false)
                                if (onSelectTab) onSelectTab('overview')
                              }}
                              className="text-[11px] font-medium text-indigo-600 hover:underline mt-1 inline-block"
                            >
                              Inspect duplicates →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Savings opportunities alert */}
                    {savingsInsights.totalCount > 0 && (
                      <div className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">
                              Unused Subscription Waste Detected
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {savingsInsights.totalCount} subscription{savingsInsights.totalCount === 1 ? '' : 's'} marked
                              rarely or never used (${savingsInsights.totalMonthlyWaste}/mo).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {totalAlerts === 0 && (
                      <div className="p-6 text-center text-slate-500">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-slate-800">All clear!</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          No pending renewals or duplicate issues found.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick "+ Add Subscription" Primary Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subscription</span>
            </button>

            {/* Profile area avatar */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-medium text-xs flex items-center justify-center">
                AM
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (visible only on mobile) */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
