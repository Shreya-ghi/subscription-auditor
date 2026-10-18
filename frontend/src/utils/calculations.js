/**
 * Utility functions for subscription financial calculations,
 * date manipulations, duplicate detection, and savings audits.
 */

/**
 * Parses date string safely in local time without UTC offset drift for YYYY-MM-DD.
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
    const [year, month, day] = dateString.trim().split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  const d = new Date(dateString)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Calculates normalized monthly cost of a subscription.
 * If billing cycle is yearly, monthly cost is price / 12.
 */
export function calculateMonthlyCost(subscription) {
  if (!subscription || subscription.price === undefined || subscription.price === null) return 0
  const price = Number(subscription.price)
  if (isNaN(price) || price < 0) return 0

  if (subscription.billingCycle === 'yearly') {
    return price / 12
  }
  return price
}

/**
 * Calculates normalized annual cost of a subscription.
 * If billing cycle is monthly, annual cost is price * 12.
 */
export function calculateAnnualCost(subscription) {
  if (!subscription || subscription.price === undefined || subscription.price === null) return 0
  const price = Number(subscription.price)
  if (isNaN(price) || price < 0) return 0

  if (subscription.billingCycle === 'monthly') {
    return price * 12
  }
  return price
}

/**
 * Calculates total monthly recurring expense across active subscriptions.
 */
export function calculateTotalMonthly(subscriptions = []) {
  return subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + calculateMonthlyCost(s), 0)
}

/**
 * Calculates total annual recurring expense across active subscriptions.
 */
export function calculateTotalAnnual(subscriptions = []) {
  return subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + calculateAnnualCost(s), 0)
}

/**
 * Calculates the difference in days from today to the given target date string.
 * Negative number means date is in the past.
 * 0 means today.
 * Positive number means in the future.
 */
export function calculateDaysUntil(dateString) {
  const target = parseLocalDate(dateString)
  if (!target) return Infinity

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formats a currency amount with symbol.
 */
export function formatCurrency(amount, currencySymbol = '$') {
  const num = Number(amount)
  if (isNaN(num)) return `${currencySymbol}0.00`
  return `${currencySymbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Formats ISO date string into human readable format, e.g. "Oct 24, 2026".
 */
export function formatDate(dateString) {
  const date = parseLocalDate(dateString)
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Returns a friendly countdown string, e.g. "Today", "Tomorrow", "In 3 days", "Overdue (2 days ago)".
 */
export function getRenewalBadgeInfo(dateString) {
  const days = calculateDaysUntil(dateString)
  if (days < 0) {
    return {
      text: `${Math.abs(days)}d overdue`,
      days,
      variant: 'danger',
    }
  }
  if (days === 0) {
    return {
      text: 'Today',
      days,
      variant: 'danger',
    }
  }
  if (days === 1) {
    return {
      text: 'Tomorrow',
      days,
      variant: 'warning',
    }
  }
  if (days <= 7) {
    return {
      text: `In ${days} days`,
      days,
      variant: 'warning',
    }
  }
  if (days <= 30) {
    return {
      text: `In ${days} days`,
      days,
      variant: 'info',
    }
  }
  return {
    text: `In ${days} days`,
    days,
    variant: 'default',
  }
}

/**
 * Filters active subscriptions renewing in the next N days (default 7 days).
 * Sorted by nearest renewal date first.
 */
export function getUpcomingRenewals(subscriptions = [], daysThreshold = 7) {
  return subscriptions
    .filter((s) => {
      if (s.status !== 'active') return false
      const days = calculateDaysUntil(s.nextRenewalDate)
      return days >= 0 && days <= daysThreshold
    })
    .sort((a, b) => calculateDaysUntil(a.nextRenewalDate) - calculateDaysUntil(b.nextRenewalDate))
}

/**
 * Groups active subscriptions by category and calculates monthly spend for charts.
 */
export function getCategoryExpenses(subscriptions = []) {
  const categoryMap = {}

  subscriptions
    .filter((s) => s.status === 'active')
    .forEach((s) => {
      const cat = s.category || 'Other'
      const monthlyCost = calculateMonthlyCost(s)
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          monthlySpend: 0,
          annualSpend: 0,
          count: 0,
        }
      }
      categoryMap[cat].monthlySpend += monthlyCost
      categoryMap[cat].annualSpend += calculateAnnualCost(s)
      categoryMap[cat].count += 1
    })

  const results = Object.values(categoryMap)
  const total = results.reduce((sum, item) => sum + item.monthlySpend, 0)

  return results
    .map((item) => ({
      ...item,
      monthlySpend: Number(item.monthlySpend.toFixed(2)),
      annualSpend: Number(item.annualSpend.toFixed(2)),
      percentage: total > 0 ? Math.round((item.monthlySpend / total) * 100) : 0,
    }))
    .sort((a, b) => b.monthlySpend - a.monthlySpend)
}

/**
 * Identifies potential duplicate or overlapping subscriptions.
 * Checks for:
 * 1. Multiple subscriptions in same high-redundancy categories (e.g. Streaming & Media, Cloud Storage, AI & Productivity)
 * 2. Exact duplicate service names
 */
export function findPotentialDuplicates(subscriptions = []) {
  const activeSubs = subscriptions.filter((s) => s.status === 'active')
  const warnings = []

  // High redundancy categories where people often pay for overlapping services
  const redundancyCategories = [
    'Streaming & Media',
    'Cloud Storage',
    'AI Tools',
    'Productivity',
    'Music & Audio',
  ]

  // 1. Group by category
  const byCategory = {}
  activeSubs.forEach((sub) => {
    const cat = sub.category || 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(sub)
  })

  Object.entries(byCategory).forEach(([category, subs]) => {
    if (subs.length > 1 && redundancyCategories.includes(category)) {
      const names = subs.map((s) => s.name).join(', ')
      // Calculate potential savings if user kept only the most expensive one or cancelled the cheapest
      const sortedByCost = [...subs].sort((a, b) => calculateMonthlyCost(b) - calculateMonthlyCost(a))
      // redundant items are everything except the primary one
      const redundantSubs = sortedByCost.slice(1)
      const potentialMonthlySavings = redundantSubs.reduce((sum, s) => sum + calculateMonthlyCost(s), 0)

      warnings.push({
        id: `dup-cat-${category}`,
        type: 'category_overlap',
        category,
        subscriptions: subs,
        title: `Multiple ${category} Subscriptions Detected`,
        message: `You are paying for ${subs.length} separate services (${names}). Consider consolidating to reduce recurring costs.`,
        potentialMonthlySavings: Number(potentialMonthlySavings.toFixed(2)),
        potentialAnnualSavings: Number((potentialMonthlySavings * 12).toFixed(2)),
      })
    }
  })

  // 2. Check for duplicate exact service names
  const nameMap = {}
  activeSubs.forEach((sub) => {
    const cleanName = sub.name.trim().toLowerCase()
    if (!nameMap[cleanName]) nameMap[cleanName] = []
    nameMap[cleanName].push(sub)
  })

  Object.entries(nameMap).forEach(([cleanName, subs]) => {
    if (subs.length > 1) {
      const exists = warnings.some((w) => w.subscriptions.some((s) => subs.includes(s)))
      if (!exists) {
        const potentialMonthlySavings = subs.slice(1).reduce((sum, s) => sum + calculateMonthlyCost(s), 0)
        warnings.push({
          id: `dup-name-${cleanName.replace(/\s+/g, '-')}`,
          type: 'name_similarity',
          category: subs[0].category,
          subscriptions: subs,
          title: `Duplicate Service Detected: "${subs[0].name}"`,
          message: `You appear to have ${subs.length} active subscription entries for "${subs[0].name}".`,
          potentialMonthlySavings: Number(potentialMonthlySavings.toFixed(2)),
          potentialAnnualSavings: Number((potentialMonthlySavings * 12).toFixed(2)),
        })
      }
    }
  })

  return warnings
}

/**
 * Calculates savings insights based on usage frequency ('rarely' or 'never').
 * Identifies unused or underutilized subscriptions and quantifies wasted expenditure.
 */
export function calculateSavingsOpportunities(subscriptions = []) {
  const underutilized = subscriptions.filter(
    (s) => s.status === 'active' && (s.usageFrequency === 'rarely' || s.usageFrequency === 'never')
  )

  const neverUsed = underutilized.filter((s) => s.usageFrequency === 'never')
  const rarelyUsed = underutilized.filter((s) => s.usageFrequency === 'rarely')

  const totalMonthlyWaste = underutilized.reduce((sum, s) => sum + calculateMonthlyCost(s), 0)
  const totalAnnualWaste = underutilized.reduce((sum, s) => sum + calculateAnnualCost(s), 0)

  return {
    underutilizedSubscriptions: underutilized,
    neverUsedCount: neverUsed.length,
    rarelyUsedCount: rarelyUsed.length,
    totalCount: underutilized.length,
    totalMonthlyWaste: Number(totalMonthlyWaste.toFixed(2)),
    totalAnnualWaste: Number(totalAnnualWaste.toFixed(2)),
  }
}
