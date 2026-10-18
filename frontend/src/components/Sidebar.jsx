import React from 'react'
import {
  LayoutDashboard,
  CreditCard,
  CalendarClock,
  PieChart,
  Settings,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react'

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  counts = {},
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'subscriptions',
      label: 'My Subscriptions',
      icon: CreditCard,
      badge: counts.totalSubscriptions,
      badgeVariant: 'neutral',
    },
    {
      id: 'renewals',
      label: 'Renewals',
      icon: CalendarClock,
      badge: counts.upcomingRenewals > 0 ? `${counts.upcomingRenewals} due` : null,
      badgeVariant: counts.upcomingRenewals > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: PieChart,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  const handleNavClick = (id) => {
    setActiveTab(id)
    if (setMobileOpen) setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top brand & navigation */}
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-sm tracking-tight block">
                  SubAuditor
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                  Smart Expense Hub
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeVariant === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom audit summary & mode badge */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {counts.potentialSavingsAnnual > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Savings Detected</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Up to <span className="font-bold">${counts.potentialSavingsAnnual.toFixed(0)}/yr</span> in
                potential optimization.
              </p>
            </div>
          )}

          {/* User profile & demo pill */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">Alex Morgan</p>
              <p className="text-[11px] text-slate-500 truncate">Auditor Workspace</p>
            </div>
            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
              Demo
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
