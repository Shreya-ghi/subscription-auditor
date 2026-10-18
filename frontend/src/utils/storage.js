import { INITIAL_SUBSCRIPTIONS } from './mockData.js'

const STORAGE_KEY = 'smart_subscription_auditor_data_v1'
const PREFS_KEY = 'smart_subscription_auditor_prefs_v1'

/**
 * Loads subscriptions from localStorage.
 * Only falls back to INITIAL_SUBSCRIPTIONS on first run or parse failure.
 * If user legitimately cleared all subscriptions, an empty array is preserved!
 */
export function loadSubscriptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      saveSubscriptions(INITIAL_SUBSCRIPTIONS)
      return INITIAL_SUBSCRIPTIONS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return INITIAL_SUBSCRIPTIONS
  } catch (err) {
    console.warn('Failed to load subscriptions from localStorage. Using defaults.', err)
    return INITIAL_SUBSCRIPTIONS
  }
}

/**
 * Persists subscriptions list to localStorage.
 */
export function saveSubscriptions(subscriptions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
  } catch (err) {
    console.error('Failed to save subscriptions to localStorage.', err)
  }
}

/**
 * Resets data to initial demo subscriptions.
 */
export function resetToDemoData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS))
  } catch (err) {
    console.error('Failed to reset demo data', err)
  }
  return INITIAL_SUBSCRIPTIONS
}

/**
 * Clears all subscriptions and keeps empty state persisted.
 */
export function clearAllSubscriptions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  } catch (err) {
    console.error('Failed to clear data', err)
  }
  return []
}

/**
 * Loads user preferences (currency, renewal alert window).
 */
export function loadPreferences() {
  const defaults = { currency: '$', renewalThreshold: 7 }
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

/**
 * Persists user preferences to localStorage.
 */
export function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch (err) {
    console.error('Failed to save preferences to localStorage.', err)
  }
}
