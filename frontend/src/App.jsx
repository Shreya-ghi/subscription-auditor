import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  loadPreferences,
  savePreferences,
  loadSubscriptionMetadata,
  updateSingleSubscriptionMetadata,
  removeSingleSubscriptionMetadata,
} from './utils/storage'
import { INITIAL_SUBSCRIPTIONS } from './utils/mockData'
import { subscriptionApi, toFrontendSubscription } from './services/api'
import { AlertCircle, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'

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

  // Subscriptions state loaded from FastAPI backend
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [viewingSubscription, setViewingSubscription] = useState(null)
  const [deletingSubscription, setDeletingSubscription] = useState(null)

  // Persist preferences (currency and renewalThreshold) to localStorage
  useEffect(() => {
    savePreferences({ currency, renewalThreshold })
  }, [currency, renewalThreshold])

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(timer)
  }, [notification])

  // Fetch all subscriptions from FastAPI backend for manual refresh / mutations
  const fetchSubscriptions = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    setIsSyncing(true)
    try {
      const backendItems = await subscriptionApi.getAll()
      const meta = loadSubscriptionMetadata()
      const mapped = backendItems.map((item) => toFrontendSubscription(item, meta[item.id] || {}))
      setSubscriptions(mapped)
      setError(null)
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message || 'Unable to connect to FastAPI backend at http://127.0.0.1:8000')
    } finally {
      setLoading(false)
      setIsSyncing(false)
    }
  }, [])

  // Initial load on mount using standard async fetch with cleanup
  useEffect(() => {
    let ignore = false

    async function loadInitialData() {
      try {
        const backendItems = await subscriptionApi.getAll()
        if (!ignore) {
          const meta = loadSubscriptionMetadata()
          const mapped = backendItems.map((item) => toFrontendSubscription(item, meta[item.id] || {}))
          setSubscriptions(mapped)
          setError(null)
        }
      } catch (err) {
        if (!ignore) {
          console.error('API Error:', err)
          setError(err.message || 'Unable to connect to FastAPI backend at http://127.0.0.1:8000')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [])

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
    () => upcomingRenewals.reduce((sum, s) => sum + (s.price ?? s.amount ?? 0), 0),
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

  // Handlers for Add, Edit, Delete with backend integration
  const handleSaveSubscription = async (subData) => {
    setIsSyncing(true)
    try {
      if (editingSubscription) {
        // Edit mode (PUT /subscriptions/{id})
        const updated = await subscriptionApi.update(editingSubscription.id, subData)
        updateSingleSubscriptionMetadata(updated.id, {
          status: subData.status,
          usageFrequency: subData.usageFrequency,
          paymentMethod: subData.paymentMethod,
          notes: subData.notes,
          currency: subData.currency,
        })
        setEditingSubscription(null)
        setIsAddModalOpen(false)
        setNotification({ type: 'success', message: `Subscription "${updated.name}" updated successfully.` })
      } else {
        // Add mode (POST /subscriptions/)
        const created = await subscriptionApi.create(subData)
        updateSingleSubscriptionMetadata(created.id, {
          status: subData.status,
          usageFrequency: subData.usageFrequency,
          paymentMethod: subData.paymentMethod,
          notes: subData.notes,
          currency: subData.currency,
        })
        setIsAddModalOpen(false)
        setNotification({ type: 'success', message: `Subscription "${created.name}" created successfully.` })
      }
      await fetchSubscriptions(true)
    } catch (err) {
      console.error('Save failed:', err)
      alert(`Save failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteConfirmed = async (subId) => {
    setIsSyncing(true)
    try {
      // Delete (DELETE /subscriptions/{id})
      await subscriptionApi.delete(subId)
      removeSingleSubscriptionMetadata(subId)
      setDeletingSubscription(null)
      if (viewingSubscription && viewingSubscription.id === subId) {
        setViewingSubscription(null)
      }
      setNotification({ type: 'success', message: 'Subscription deleted from database.' })
      await fetchSubscriptions(true)
    } catch (err) {
      console.error('Delete failed:', err)
      alert(`Delete failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  // View detail handler using GET /subscriptions/{id} to verify fresh record
  const handleViewSubscription = async (sub) => {
    if (!sub) {
      setViewingSubscription(null)
      return
    }
    try {
      const fresh = await subscriptionApi.getById(sub.id)
      const meta = loadSubscriptionMetadata()
      const mapped = toFrontendSubscription(fresh, meta[fresh.id] || sub)
      setViewingSubscription(mapped)
    } catch {
      // Fallback to local sub item if network issue
      setViewingSubscription(sub)
    }
  }

  // Populate backend database with initial sample subscriptions
  const handleResetDemo = async () => {
    if (!window.confirm('Populate backend database with standard sample subscriptions?')) return
    setIsSyncing(true)
    try {
      for (const sample of INITIAL_SUBSCRIPTIONS) {
        const created = await subscriptionApi.create(sample)
        updateSingleSubscriptionMetadata(created.id, {
          status: sample.status,
          usageFrequency: sample.usageFrequency,
          paymentMethod: sample.paymentMethod,
          notes: sample.notes,
          currency: sample.currency,
        })
      }
      setNotification({ type: 'success', message: 'Sample subscriptions created in backend database!' })
      await fetchSubscriptions(true)
    } catch (err) {
      console.error('Seed demo data failed:', err)
      alert(`Failed to seed demo data: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  // Clear all subscriptions from backend database
  const handleClearAll = async () => {
    if (!window.confirm('Delete all subscriptions from the backend database?')) return
    setIsSyncing(true)
    try {
      for (const sub of subscriptions) {
        await subscriptionApi.delete(sub.id)
        removeSingleSubscriptionMetadata(sub.id)
      }
      setNotification({ type: 'success', message: 'All subscriptions cleared from database.' })
      await fetchSubscriptions(true)
    } catch (err) {
      console.error('Clear all failed:', err)
      alert(`Failed to clear subscriptions: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleImportData = async (importedData) => {
    setIsSyncing(true)
    try {
      for (const item of importedData) {
        const created = await subscriptionApi.create(item)
        updateSingleSubscriptionMetadata(created.id, {
          status: item.status || 'active',
          usageFrequency: item.usageFrequency || 'daily',
          paymentMethod: item.paymentMethod || 'Imported Card',
          notes: item.notes || '',
          currency: item.currency || currency,
        })
      }
      setNotification({ type: 'success', message: `Imported ${importedData.length} subscriptions into database!` })
      await fetchSubscriptions(true)
    } catch (err) {
      console.error('Import failed:', err)
      alert(`Import failed: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
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
          {/* Toast Notification */}
          {notification && (
            <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Backend Connection Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">Backend Connection Failed: </span>
                  <span>{error}</span>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Make sure the FastAPI server is running with: <code>uvicorn app.main:app --reload --port 8000</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchSubscriptions()}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Backend Status Notice Banner */}
          <DemoNotice
            backendConnected={!error}
            isSyncing={isSyncing}
            onResetDemo={handleResetDemo}
            onClearAll={handleClearAll}
            onRefresh={() => fetchSubscriptions()}
          />

          {/* Full Page Initial Loading State */}
          {loading && subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Connecting to FastAPI backend & loading subscriptions...</p>
            </div>
          ) : (
            <>
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
                    onViewSubscription={handleViewSubscription}
                    currency={currency}
                  />

                  {/* Savings Insights & Usage Waste Audit */}
                  <SavingsInsights
                    savingsInsights={savingsInsights}
                    onViewSubscription={handleViewSubscription}
                    onEditSubscription={(sub) => {
                      setEditingSubscription(sub)
                      setIsAddModalOpen(true)
                    }}
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
                        onViewSubscription={handleViewSubscription}
                        onSelectTab={setActiveTab}
                        currency={currency}
                      />
                    </div>
                  </div>

                  {/* Subscription Portfolio Table */}
                  <SubscriptionTable
                    subscriptions={subscriptions}
                    onViewSubscription={handleViewSubscription}
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
                    onViewSubscription={handleViewSubscription}
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
                    onViewSubscription={handleViewSubscription}
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
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Subscription Modal */}
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
          setIsAddModalOpen(true)
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
