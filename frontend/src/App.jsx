import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import SubscriptionTable from './components/SubscriptionTable'
import SubscriptionModal from './components/SubscriptionModal'
import SubscriptionDetailModal from './components/SubscriptionDetailModal'
import UpcomingRenewals from './components/UpcomingRenewals'
import ExpenseCharts from './components/ExpenseCharts'
import DuplicateWarnings from './components/DuplicateWarnings'
import SavingsInsights from './components/SavingsInsights'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import DemoNotice from './components/DemoNotice'
import RenewalsView from './components/RenewalsView'
import AnalyticsView from './components/AnalyticsView'
import SettingsView from './components/SettingsView'

import {
  calculateTotalMonthly,
  calculateTotalAnnual,
  getUpcomingRenewals,
  getCategoryExpenses,
  findPotentialDuplicates,
  calculateSavingsOpportunities,
} from './utils/calculations'
import {
  loadSubscriptions,
  saveSubscriptions,
  resetToDemoData,
  clearAllSubscriptions,
  loadPreferences,
  savePreferences,
} from './utils/storage'

export default function App() {
  // User Preferences persisted in localStorage
  const initialPrefs = useMemo(() => loadPreferences(), [])
  const [currency, setCurrency] = useState(initialPrefs.currency || '$')
  const [renewalThreshold, setRenewalThreshold] = useState(initialPrefs.renewalThreshold || 7)

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilterOverride, setCategoryFilterOverride] = useState('all')

  // Subscriptions state loaded from localStorage
  const [subscriptions, setSubscriptions] = useState(() => loadSubscriptions())

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [viewingSubscription, setViewingSubscription] = useState(null)
  const [deletingSubscription, setDeletingSubscription] = useState(null)

  // Persist subscriptions to localStorage
  useEffect(() => {
    saveSubscriptions(subscriptions)
  }, [subscriptions])

  // Persist preferences (currency and renewalThreshold) to localStorage
  useEffect(() => {
    savePreferences({ currency, renewalThreshold })
  }, [currency, renewalThreshold])

  // Calculated Metrics
  const totalMonthly = useMemo(() => calculateTotalMonthly(subscriptions), [subscriptions])
  const totalAnnual = useMemo(() => calculateTotalAnnual(subscriptions), [subscriptions])

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'active').length,
    [subscriptions]
  )
  const pausedCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'paused').length,
    [subscriptions]
  )

  const upcomingRenewals = useMemo(
    () => getUpcomingRenewals(subscriptions, renewalThreshold),
    [subscriptions, renewalThreshold]
  )
  const upcomingRenewalsCost = useMemo(
    () => upcomingRenewals.reduce((sum, s) => sum + s.price, 0),
    [upcomingRenewals]
  )

  const categoryData = useMemo(
    () => getCategoryExpenses(subscriptions),
    [subscriptions]
  )

  const duplicateWarnings = useMemo(
    () => findPotentialDuplicates(subscriptions),
    [subscriptions]
  )

  const savingsInsights = useMemo(
    () => calculateSavingsOpportunities(subscriptions),
    [subscriptions]
  )

  // Handlers for Add, Edit, Delete
  const handleSaveSubscription = (subData) => {
    if (editingSubscription) {
      // Edit mode
      setSubscriptions((prev) =>
        prev.map((item) => (item.id === subData.id ? { ...item, ...subData } : item))
      )
      setEditingSubscription(null)
    } else {
      // Add mode
      setSubscriptions((prev) => [subData, ...prev])
      setIsAddModalOpen(false)
    }
  }

  const handleDeleteConfirmed = (subId) => {
    setSubscriptions((prev) => prev.filter((item) => item.id !== subId))
    setDeletingSubscription(null)
    if (viewingSubscription && viewingSubscription.id === subId) {
      setViewingSubscription(null)
    }
  }

  const handleResetDemo = () => {
    const data = resetToDemoData()
    setSubscriptions(data)
  }

  const handleClearAll = () => {
    const data = clearAllSubscriptions()
    setSubscriptions(data)
  }

  const handleImportData = (importedData) => {
    setSubscriptions(importedData)
    saveSubscriptions(importedData)
  }

  const handleFilterCategory = (categoryName) => {
    setActiveTab('subscriptions')
    setCategoryFilterOverride(categoryName)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        counts={{
          totalSubscriptions: subscriptions.length,
          upcomingRenewals: upcomingRenewals.length,
          potentialSavingsAnnual: savingsInsights.totalAnnualWaste,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddModal={() => {
            setEditingSubscription(null)
            setIsAddModalOpen(true)
          }}
          setMobileOpen={setMobileOpen}
          upcomingRenewals={upcomingRenewals}
          duplicateWarnings={duplicateWarnings}
          savingsInsights={savingsInsights}
          onSelectTab={setActiveTab}
        />

        {/* Page Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Demo Mode Notice Banner */}
          <DemoNotice onResetDemo={handleResetDemo} onClearAll={handleClearAll} />

          {/* VIEW: OVERVIEW (Main Dashboard) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Summary Cards */}
              <SummaryCards
                totalMonthly={totalMonthly}
                totalAnnual={totalAnnual}
                activeCount={activeCount}
                pausedCount={pausedCount}
                totalCount={subscriptions.length}
                upcomingRenewalsCount={upcomingRenewals.length}
                upcomingRenewalsCost={upcomingRenewalsCost}
                currency={currency}
                onSelectTab={setActiveTab}
              />

              {/* Potential Duplicate Subscriptions Alert */}
              <DuplicateWarnings
                warnings={duplicateWarnings}
                onFilterCategory={handleFilterCategory}
                onViewSubscription={setViewingSubscription}
                currency={currency}
              />

              {/* Savings Insights & Usage Waste Audit */}
              <SavingsInsights
                savingsInsights={savingsInsights}
                onViewSubscription={setViewingSubscription}
                onEditSubscription={setEditingSubscription}
                currency={currency}
              />

              {/* Two Column Section: Expense Charts & Upcoming Renewals */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <ExpenseCharts
                    categoryData={categoryData}
                    subscriptions={subscriptions}
                    currency={currency}
                  />
                </div>
                <div className="lg:col-span-5">
                  <UpcomingRenewals
                    renewals={upcomingRenewals}
                    onViewSubscription={setViewingSubscription}
                    onSelectTab={setActiveTab}
                    currency={currency}
                  />
                </div>
              </div>

              {/* Subscription Portfolio Table */}
              <SubscriptionTable
                subscriptions={subscriptions}
                onViewSubscription={setViewingSubscription}
                onEditSubscription={(sub) => {
                  setEditingSubscription(sub)
                  setIsAddModalOpen(true)
                }}
                onDeleteSubscription={setDeletingSubscription}
                onOpenAddModal={() => {
                  setEditingSubscription(null)
                  setIsAddModalOpen(true)
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                initialCategoryFilter={categoryFilterOverride}
              />
            </div>
          )}

          {/* VIEW: MY SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <SubscriptionTable
                subscriptions={subscriptions}
                onViewSubscription={setViewingSubscription}
                onEditSubscription={(sub) => {
                  setEditingSubscription(sub)
                  setIsAddModalOpen(true)
                }}
                onDeleteSubscription={setDeletingSubscription}
                onOpenAddModal={() => {
                  setEditingSubscription(null)
                  setIsAddModalOpen(true)
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                initialCategoryFilter={categoryFilterOverride}
              />
            </div>
          )}

          {/* VIEW: RENEWALS */}
          {activeTab === 'renewals' && (
            <div className="animate-in fade-in duration-150">
              <RenewalsView
                subscriptions={subscriptions}
                onViewSubscription={setViewingSubscription}
                currency={currency}
              />
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-150">
              <AnalyticsView
                subscriptions={subscriptions}
                categoryData={categoryData}
                currency={currency}
              />
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-150">
              <SettingsView
                currency={currency}
                setCurrency={setCurrency}
                renewalThreshold={renewalThreshold}
                setRenewalThreshold={setRenewalThreshold}
                subscriptions={subscriptions}
                onResetDemo={handleResetDemo}
                onImportData={handleImportData}
              />
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Subscription Modal - Rendered conditionally with unique key for pristine state */}
      {(isAddModalOpen || Boolean(editingSubscription)) && (
        <SubscriptionModal
          key={editingSubscription ? `edit-${editingSubscription.id}` : 'add-new'}
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false)
            setEditingSubscription(null)
          }}
          onSave={handleSaveSubscription}
          subscription={editingSubscription}
        />
      )}

      {/* View Subscription Detail Modal */}
      <SubscriptionDetailModal
        isOpen={Boolean(viewingSubscription)}
        onClose={() => setViewingSubscription(null)}
        subscription={viewingSubscription}
        onEdit={(sub) => {
          setViewingSubscription(null)
          setEditingSubscription(sub)
        }}
        onDelete={(sub) => {
          setViewingSubscription(null)
          setDeletingSubscription(sub)
        }}
        allSubscriptions={subscriptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSubscription)}
        onClose={() => setDeletingSubscription(null)}
        onConfirm={handleDeleteConfirmed}
        subscription={deletingSubscription}
      />
    </div>
  )
}
