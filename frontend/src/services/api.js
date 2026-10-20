/**
 * Centralized API service for communicating with the FastAPI backend.
 * Base URL: http://127.0.0.1:8000
 */

const API_BASE_URL = 'http://127.0.0.1:8000'

/**
 * Normalizes frontend subscription data to the schema expected by FastAPI:
 * - name: string (non-empty)
 * - category: string (non-empty)
 * - amount: float (> 0)
 * - billing_cycle: 'Monthly' | 'Quarterly' | 'Yearly'
 * - next_renewal: 'YYYY-MM-DD'
 */
export function toBackendSubscription(data) {
  let cycle = 'Monthly'
  const rawCycle = (data.billingCycle || data.billing_cycle || '').trim().toLowerCase()
  if (rawCycle === 'yearly') cycle = 'Yearly'
  else if (rawCycle === 'quarterly') cycle = 'Quarterly'
  else cycle = 'Monthly'

  // Extract raw price/amount
  const amount = parseFloat(data.price !== undefined ? data.price : data.amount)

  // Ensure next renewal date is YYYY-MM-DD
  const nextRenewal = data.nextRenewalDate || data.next_renewal || new Date().toISOString().split('T')[0]

  return {
    name: (data.name || '').trim(),
    category: (data.category || '').trim(),
    amount: isNaN(amount) ? 0 : amount,
    billing_cycle: cycle,
    next_renewal: nextRenewal,
  }
}

/**
 * Transforms a backend subscription record into the frontend data model,
 * merging any auxiliary client metadata (status, usage, notes, etc.).
 */
export function toFrontendSubscription(item, existingMeta = {}) {
  const amount = Number(item.amount)
  const cycleLower = (item.billing_cycle || 'Monthly').toLowerCase()
  const renewalDate = item.next_renewal

  return {
    // Retain existing client-only properties if present
    ...existingMeta,
    id: item.id,
    name: item.name,
    category: item.category,
    price: amount,
    amount: amount,
    billingCycle: cycleLower,
    billing_cycle: item.billing_cycle,
    nextRenewalDate: renewalDate,
    next_renewal: renewalDate,
    // Sensible defaults for client-only audit fields
    status: existingMeta.status || 'active',
    currency: existingMeta.currency || '$',
    usageFrequency: existingMeta.usageFrequency || 'daily',
    paymentMethod: existingMeta.paymentMethod || 'Visa •••• 4242',
    notes: existingMeta.notes || '',
  }
}

/**
 * Subscription API client providing CRUD methods.
 */
export const subscriptionApi = {
  /**
   * Fetch all subscriptions (GET /subscriptions/)
   */
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/subscriptions/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Failed to fetch subscriptions (HTTP ${res.status})`)
    }
    return res.json()
  },

  /**
   * Fetch a single subscription by ID (GET /subscriptions/{id})
   */
  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Subscription #${id} not found (HTTP ${res.status})`)
    }
    return res.json()
  },

  /**
   * Create a new subscription (POST /subscriptions/)
   */
  async create(data) {
    const payload = toBackendSubscription(data)
    const res = await fetch(`${API_BASE_URL}/subscriptions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Failed to create subscription (HTTP ${res.status})`)
    }
    return res.json()
  },

  /**
   * Update an existing subscription (PUT /subscriptions/{id})
   */
  async update(id, data) {
    const payload = toBackendSubscription(data)
    const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Failed to update subscription #${id} (HTTP ${res.status})`)
    }
    return res.json()
  },

  /**
   * Delete a subscription by ID (DELETE /subscriptions/{id})
   */
  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok && res.status !== 204 && res.status !== 404) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Failed to delete subscription #${id} (HTTP ${res.status})`)
    }
    return true
  },
}
