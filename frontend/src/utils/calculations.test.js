import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  calculateMonthlyCost,
  calculateAnnualCost,
  calculateTotalMonthly,
  calculateTotalAnnual,
  parseLocalDate,
  calculateDaysUntil,
  formatCurrency,
  formatDate,
  getRenewalBadgeInfo,
  getUpcomingRenewals,
  getCategoryExpenses,
  findPotentialDuplicates,
  calculateSavingsOpportunities,
} from './calculations'

describe('Subscription cost calculations', () => {
  it('returns the monthly price for a monthly subscription', () => {
    expect(calculateMonthlyCost({ price: 100, billingCycle: 'monthly' })).toBe(100)
  })

  it('converts yearly price to monthly cost', () => {
    expect(calculateMonthlyCost({ price: 1200, billingCycle: 'yearly' })).toBe(100)
  })

  it('converts quarterly price to monthly cost', () => {
    expect(calculateMonthlyCost({ price: 300, billingCycle: 'quarterly' })).toBe(100)
  })

  it('calculates annual cost for a monthly subscription', () => {
    expect(calculateAnnualCost({ price: 100, billingCycle: 'monthly' })).toBe(1200)
  })

  it('calculates annual cost for a quarterly subscription', () => {
    expect(calculateAnnualCost({ price: 300, billingCycle: 'quarterly' })).toBe(1200)
  })

  it('returns zero for a missing subscription or invalid price', () => {
    expect(calculateMonthlyCost(null)).toBe(0)
    expect(calculateMonthlyCost({ price: 'invalid' })).toBe(0)
    expect(calculateAnnualCost({ price: -10 })).toBe(0)
  })

  it('totals only active subscriptions', () => {
    const subscriptions = [
      { price: 100, billingCycle: 'monthly', status: 'active' },
      { price: 1200, billingCycle: 'yearly', status: 'active' },
      { price: 50, billingCycle: 'monthly', status: 'cancelled' },
    ]

    expect(calculateTotalMonthly(subscriptions)).toBe(200)
    expect(calculateTotalAnnual(subscriptions)).toBe(2400)
  })

  it('supports amount property as an alternative to price and handles string prices', () => {
    expect(calculateMonthlyCost({ amount: 60, billingCycle: 'monthly' })).toBe(60)
    expect(calculateAnnualCost({ amount: 60, billingCycle: 'monthly' })).toBe(720)
    expect(calculateMonthlyCost({ price: '120', billingCycle: 'yearly' })).toBe(10)
    expect(calculateMonthlyCost({ billing_cycle: 'yearly', price: 240 })).toBe(20)
  })
})

describe('Date manipulation and formatting utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 20, 10, 0, 0)) // Oct 20, 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('parseLocalDate', () => {
    it('parses YYYY-MM-DD into a local Date at midnight without timezone shift', () => {
      const parsed = parseLocalDate('2026-10-25')
      expect(parsed).toBeInstanceOf(Date)
      expect(parsed.getFullYear()).toBe(2026)
      expect(parsed.getMonth()).toBe(9) // 0-indexed month: 9 = October
      expect(parsed.getDate()).toBe(25)
      expect(parsed.getHours()).toBe(0)
    })

    it('parses standard ISO date-time strings', () => {
      const parsed = parseLocalDate('2026-10-25T14:30:00Z')
      expect(parsed).toBeInstanceOf(Date)
      expect(isNaN(parsed.getTime())).toBe(false)
    })

    it('returns null for missing or invalid dates', () => {
      expect(parseLocalDate(null)).toBeNull()
      expect(parseLocalDate(undefined)).toBeNull()
      expect(parseLocalDate('')).toBeNull()
      expect(parseLocalDate('invalid-date')).toBeNull()
    })
  })

  describe('calculateDaysUntil', () => {
    it('returns 0 for today', () => {
      expect(calculateDaysUntil('2026-10-20')).toBe(0)
    })

    it('returns 1 for tomorrow and positive numbers for future dates', () => {
      expect(calculateDaysUntil('2026-10-21')).toBe(1)
      expect(calculateDaysUntil('2026-10-25')).toBe(5)
      expect(calculateDaysUntil('2026-11-20')).toBe(31)
    })

    it('returns negative numbers for past dates', () => {
      expect(calculateDaysUntil('2026-10-18')).toBe(-2)
    })

    it('returns Infinity for invalid or null date', () => {
      expect(calculateDaysUntil(null)).toBe(Infinity)
      expect(calculateDaysUntil('not-a-date')).toBe(Infinity)
    })
  })

  describe('formatDate', () => {
    it('formats valid date string to readable format', () => {
      expect(formatDate('2026-10-25')).toBe('Oct 25, 2026')
    })

    it('returns N/A for invalid or empty date', () => {
      expect(formatDate(null)).toBe('N/A')
      expect(formatDate('')).toBe('N/A')
      expect(formatDate('invalid')).toBe('N/A')
    })
  })

  describe('getRenewalBadgeInfo', () => {
    it('returns danger badge for overdue dates', () => {
      const badge = getRenewalBadgeInfo('2026-10-17')
      expect(badge.variant).toBe('danger')
      expect(badge.text).toBe('3d overdue')
      expect(badge.days).toBe(-3)
    })

    it('returns danger badge for today', () => {
      const badge = getRenewalBadgeInfo('2026-10-20')
      expect(badge.variant).toBe('danger')
      expect(badge.text).toBe('Today')
      expect(badge.days).toBe(0)
    })

    it('returns warning badge for tomorrow', () => {
      const badge = getRenewalBadgeInfo('2026-10-21')
      expect(badge.variant).toBe('warning')
      expect(badge.text).toBe('Tomorrow')
      expect(badge.days).toBe(1)
    })

    it('returns warning badge for renewals within 7 days', () => {
      const badge = getRenewalBadgeInfo('2026-10-25')
      expect(badge.variant).toBe('warning')
      expect(badge.text).toBe('In 5 days')
      expect(badge.days).toBe(5)
    })

    it('returns info badge for renewals within 8 to 30 days', () => {
      const badge = getRenewalBadgeInfo('2026-11-05')
      expect(badge.variant).toBe('info')
      expect(badge.text).toBe('In 16 days')
      expect(badge.days).toBe(16)
    })

    it('returns default badge for renewals beyond 30 days', () => {
      const badge = getRenewalBadgeInfo('2026-12-15')
      expect(badge.variant).toBe('default')
      expect(badge.text).toBe('In 56 days')
      expect(badge.days).toBe(56)
    })
  })
})

describe('formatCurrency', () => {
  it('formats positive numbers with default USD $ symbol', () => {
    expect(formatCurrency(24.5)).toBe('$24.50')
    expect(formatCurrency(1200)).toBe('$1,200.00')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('supports custom currency symbols', () => {
    expect(formatCurrency(19.99, '€')).toBe('€19.99')
    expect(formatCurrency(5000, '₹')).toBe('₹5,000.00')
    expect(formatCurrency(99.95, '£')).toBe('£99.95')
  })

  it('handles invalid inputs gracefully by returning 0.00', () => {
    expect(formatCurrency('abc')).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
    expect(formatCurrency(null)).toBe('$0.00')
  })
})

describe('getUpcomingRenewals', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 20, 10, 0, 0)) // Oct 20, 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('filters active subscriptions within threshold and sorts them ascending by renewal date', () => {
    const subscriptions = [
      { id: '1', name: 'Due in 6 days', nextRenewalDate: '2026-10-26', status: 'active', price: 10 },
      { id: '2', name: 'Due in 2 days', nextRenewalDate: '2026-10-22', status: 'active', price: 15 },
      { id: '3', name: 'Due in 15 days', nextRenewalDate: '2026-11-04', status: 'active', price: 20 },
      { id: '4', name: 'Overdue (past)', nextRenewalDate: '2026-10-18', status: 'active', price: 25 },
      { id: '5', name: 'Due in 3 days but paused', nextRenewalDate: '2026-10-23', status: 'paused', price: 30 },
      { id: '6', name: 'Due in 1 day but cancelled', nextRenewalDate: '2026-10-21', status: 'cancelled', price: 35 },
    ]

    const upcoming = getUpcomingRenewals(subscriptions, 7)
    expect(upcoming).toHaveLength(2)
    // Nearest renewal first: Oct 22 before Oct 26
    expect(upcoming[0].id).toBe('2')
    expect(upcoming[1].id).toBe('1')
  })

  it('supports custom daysThreshold and next_renewal fallback field name', () => {
    const subscriptions = [
      { id: '1', name: 'Due in 10 days', next_renewal: '2026-10-30', status: 'active', price: 50 },
      { id: '2', name: 'Due in 20 days', next_renewal: '2026-11-09', status: 'active', price: 60 },
    ]

    const upcoming14 = getUpcomingRenewals(subscriptions, 14)
    expect(upcoming14).toHaveLength(1)
    expect(upcoming14[0].id).toBe('1')
  })

  it('returns empty array when subscriptions list is empty or none qualify', () => {
    expect(getUpcomingRenewals([], 7)).toEqual([])
    expect(getUpcomingRenewals([{ nextRenewalDate: '2026-10-22', status: 'cancelled' }], 7)).toEqual([])
  })
})

describe('getCategoryExpenses', () => {
  it('groups active subscriptions by category and calculates spend, percentage, and counts', () => {
    const subscriptions = [
      { name: 'Netflix', category: 'Streaming & Media', price: 20, billingCycle: 'monthly', status: 'active' },
      { name: 'Spotify', category: 'Music & Audio', price: 10, billingCycle: 'monthly', status: 'active' },
      { name: 'Disney+', category: 'Streaming & Media', price: 10, billingCycle: 'monthly', status: 'active' },
      { name: 'Gym', category: 'Health & Fitness', price: 50, billingCycle: 'monthly', status: 'paused' }, // Paused excluded
      { name: 'Cancelled Tool', category: 'Productivity', price: 15, billingCycle: 'monthly', status: 'cancelled' },
    ]

    // Active spend: Streaming = $30/mo, Music = $10/mo -> Total = $40/mo
    // Streaming = 30 / 40 = 75%, Music = 10 / 40 = 25%
    const categories = getCategoryExpenses(subscriptions)

    expect(categories).toHaveLength(2)
    // Sorted descending by monthly spend
    expect(categories[0].name).toBe('Streaming & Media')
    expect(categories[0].monthlySpend).toBe(30)
    expect(categories[0].annualSpend).toBe(360)
    expect(categories[0].count).toBe(2)
    expect(categories[0].percentage).toBe(75)

    expect(categories[1].name).toBe('Music & Audio')
    expect(categories[1].monthlySpend).toBe(10)
    expect(categories[1].annualSpend).toBe(120)
    expect(categories[1].count).toBe(1)
    expect(categories[1].percentage).toBe(25)
  })

  it('defaults category to Other when category field is missing', () => {
    const subscriptions = [
      { name: 'Unknown Subscription', price: 15, billingCycle: 'monthly', status: 'active' },
    ]

    const categories = getCategoryExpenses(subscriptions)
    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Other')
    expect(categories[0].percentage).toBe(100)
  })

  it('returns empty array when subscriptions list is empty or has no active subscriptions', () => {
    expect(getCategoryExpenses([])).toEqual([])
    expect(getCategoryExpenses([{ status: 'paused', price: 10 }])).toEqual([])
  })
})

describe('findPotentialDuplicates', () => {
  it('detects category overlap in redundancy categories and calculates consolidation savings', () => {
    const subscriptions = [
      { id: '1', name: 'Netflix Premium', category: 'Streaming & Media', price: 20, billingCycle: 'monthly', status: 'active' },
      { id: '2', name: 'Disney+', category: 'Streaming & Media', price: 14, billingCycle: 'monthly', status: 'active' },
      { id: '3', name: 'Hulu', category: 'Streaming & Media', price: 8, billingCycle: 'monthly', status: 'active' },
      { id: '4', name: 'AWS Hosting', category: 'Cloud & Hosting', price: 50, billingCycle: 'monthly', status: 'active' },
    ]

    const duplicates = findPotentialDuplicates(subscriptions)
    expect(duplicates.length).toBeGreaterThanOrEqual(1)

    const streamingWarning = duplicates.find((w) => w.category === 'Streaming & Media')
    expect(streamingWarning).toBeDefined()
    expect(streamingWarning.type).toBe('category_overlap')
    expect(streamingWarning.subscriptions).toHaveLength(3)

    // Consolidation savings: keeping highest ($20), savings = $14 + $8 = $22/mo -> $264/yr
    expect(streamingWarning.potentialMonthlySavings).toBe(22)
    expect(streamingWarning.potentialAnnualSavings).toBe(264)
  })

  it('detects exact duplicate service names', () => {
    const subscriptions = [
      { id: '1', name: 'ChatGPT Plus', category: 'AI Tools', price: 20, billingCycle: 'monthly', status: 'active' },
      { id: '2', name: 'chatgpt plus', category: 'AI Tools', price: 20, billingCycle: 'monthly', status: 'active' },
    ]

    const duplicates = findPotentialDuplicates(subscriptions)
    expect(duplicates.length).toBeGreaterThanOrEqual(1)
    const nameDup = duplicates.find((w) => w.type === 'name_similarity' || w.type === 'category_overlap')
    expect(nameDup).toBeDefined()
    expect(nameDup.potentialMonthlySavings).toBe(20)
  })

  it('ignores cancelled or paused subscriptions when evaluating duplicates', () => {
    const subscriptions = [
      { id: '1', name: 'Dropbox Plus', category: 'Cloud Storage', price: 10, billingCycle: 'monthly', status: 'active' },
      { id: '2', name: 'Google One', category: 'Cloud Storage', price: 10, billingCycle: 'monthly', status: 'cancelled' },
    ]

    const duplicates = findPotentialDuplicates(subscriptions)
    expect(duplicates).toHaveLength(0)
  })

  it('returns empty array when no duplicates exist', () => {
    const subscriptions = [
      { id: '1', name: 'GitHub', category: 'Developer Tools', price: 10, billingCycle: 'monthly', status: 'active' },
      { id: '2', name: 'Spotify', category: 'Music & Audio', price: 10, billingCycle: 'monthly', status: 'active' },
    ]

    expect(findPotentialDuplicates(subscriptions)).toEqual([])
  })
})

describe('calculateSavingsOpportunities', () => {
  it('calculates waste for subscriptions marked rarely or never used', () => {
    const subscriptions = [
      { id: '1', name: 'Daily Tool', price: 10, billingCycle: 'monthly', status: 'active', usageFrequency: 'daily' },
      { id: '2', name: 'Unused Gym', price: 50, billingCycle: 'monthly', status: 'active', usageFrequency: 'never' },
      { id: '3', name: 'Old Storage', price: 120, billingCycle: 'yearly', status: 'active', usageFrequency: 'rarely' },
      { id: '4', name: 'Paused Unused', price: 30, billingCycle: 'monthly', status: 'paused', usageFrequency: 'never' }, // Inactive excluded
    ]

    const savings = calculateSavingsOpportunities(subscriptions)

    expect(savings.totalCount).toBe(2)
    expect(savings.neverUsedCount).toBe(1)
    expect(savings.rarelyUsedCount).toBe(1)
    expect(savings.underutilizedSubscriptions).toHaveLength(2)

    // Unused Gym: $50/mo ($600/yr)
    // Old Storage: $120/yr ($10/mo)
    // Total Monthly Waste: $50 + $10 = $60
    // Total Annual Waste: $600 + $120 = $720
    expect(savings.totalMonthlyWaste).toBe(60)
    expect(savings.totalAnnualWaste).toBe(720)
  })

  it('returns zero waste when all active subscriptions are frequently used', () => {
    const subscriptions = [
      { id: '1', name: 'Tool A', price: 10, billingCycle: 'monthly', status: 'active', usageFrequency: 'daily' },
      { id: '2', name: 'Tool B', price: 20, billingCycle: 'monthly', status: 'active', usageFrequency: 'weekly' },
    ]

    const savings = calculateSavingsOpportunities(subscriptions)
    expect(savings.totalCount).toBe(0)
    expect(savings.totalMonthlyWaste).toBe(0)
    expect(savings.totalAnnualWaste).toBe(0)
  })

  it('handles empty subscriptions array gracefully', () => {
    const savings = calculateSavingsOpportunities([])
    expect(savings.totalCount).toBe(0)
    expect(savings.totalMonthlyWaste).toBe(0)
    expect(savings.totalAnnualWaste).toBe(0)
  })
})
