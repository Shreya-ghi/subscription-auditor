const PREFS_KEY = 'smart_subscription_auditor_prefs_v1'
const META_KEY = 'smart_subscription_auditor_meta_v1'

/**
 * Loads user preferences (currency, renewal alert window threshold).
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

/**
 * Loads client-side subscription metadata (status, notes, paymentMethod, usageFrequency)
 * keyed by backend subscription ID.
 */
export function loadSubscriptionMetadata() {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Persists client-side subscription metadata to localStorage.
 */
export function saveSubscriptionMetadata(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch (err) {
    console.error('Failed to save subscription metadata to localStorage.', err)
  }
}

/**
 * Updates metadata for a single subscription ID.
 */
export function updateSingleSubscriptionMetadata(id, extraFields) {
  const allMeta = loadSubscriptionMetadata()
  allMeta[id] = {
    ...(allMeta[id] || {}),
    ...extraFields,
  }
  saveSubscriptionMetadata(allMeta)
}

/**
 * Removes metadata for a deleted subscription ID.
 */
export function removeSingleSubscriptionMetadata(id) {
  const allMeta = loadSubscriptionMetadata()
  if (allMeta[id]) {
    delete allMeta[id]
    saveSubscriptionMetadata(allMeta)
  }
}
