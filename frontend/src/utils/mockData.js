/**
 * Mock data and presets for Smart Subscription Auditor
 */

export const CATEGORIES = [
  'Streaming & Media',
  'Productivity',
  'Developer Tools',
  'Cloud Storage',
  'Cloud & Hosting',
  'AI Tools',
  'Utilities',
  'Health & Fitness',
  'Music & Audio',
  'Other',
]

export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export const USAGE_FREQUENCIES = [
  { value: 'daily', label: 'Daily', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'weekly', label: 'Weekly', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'monthly', label: 'Monthly', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'rarely', label: 'Rarely used', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'never', label: 'Never used', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
]

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'paused', label: 'Paused', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'cancelled', label: 'Cancelled', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200' },
]

export const PAYMENT_METHODS = [
  'Visa •••• 4242',
  'Mastercard •••• 8821',
  'American Express •••• 1004',
  'PayPal (user@domain.com)',
  'Apple Pay',
  'Bank Direct Debit',
]

/**
 * Returns a formatted YYYY-MM-DD date string offset by daysAhead from today.
 */
function getRelativeDate(daysAhead) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split('T')[0]
}

export const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    name: 'Netflix Premium',
    category: 'Streaming & Media',
    price: 22.99,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(2), // In 2 days! (Upcoming renewal)
    status: 'active',
    usageFrequency: 'daily',
    paymentMethod: 'Visa •••• 4242',
    notes: 'Family 4K plan. Shared with siblings.',
  },
  {
    id: 'sub-2',
    name: 'Disney+ Bundle',
    category: 'Streaming & Media',
    price: 13.99,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(5), // In 5 days! (Upcoming renewal + Streaming duplicate overlap)
    status: 'active',
    usageFrequency: 'rarely', // Savings opportunity
    paymentMethod: 'PayPal (user@domain.com)',
    notes: 'Hulu + Disney+ bundle. Rarely watched since last month.',
  },
  {
    id: 'sub-3',
    name: 'GitHub Copilot',
    category: 'Developer Tools',
    price: 10.0,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(6), // In 6 days! (Upcoming renewal)
    status: 'active',
    usageFrequency: 'daily',
    paymentMethod: 'Mastercard •••• 8821',
    notes: 'Essential AI pair programmer for daily coding workflows.',
  },
  {
    id: 'sub-4',
    name: 'OpenAI ChatGPT Plus',
    category: 'AI Tools',
    price: 20.0,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(14),
    status: 'active',
    usageFrequency: 'daily',
    paymentMethod: 'Visa •••• 4242',
    notes: 'GPT-4o and Advanced Voice access.',
  },
  {
    id: 'sub-5',
    name: 'Claude Pro (Anthropic)',
    category: 'AI Tools',
    price: 20.0,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(18), // AI overlap duplicate warning!
    status: 'active',
    usageFrequency: 'weekly',
    paymentMethod: 'Visa •••• 4242',
    notes: 'Sonnet 3.7 access with extended reasoning limits.',
  },
  {
    id: 'sub-6',
    name: 'AWS Cloud Hosting',
    category: 'Cloud & Hosting',
    price: 48.5,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(22),
    status: 'active',
    usageFrequency: 'daily',
    paymentMethod: 'Mastercard •••• 8821',
    notes: 'EC2 t4g.medium instance + RDS Postgres database.',
  },
  {
    id: 'sub-7',
    name: 'Google One 2TB Storage',
    category: 'Cloud Storage',
    price: 99.99,
    currency: '$',
    billingCycle: 'yearly',
    nextRenewalDate: getRelativeDate(85),
    status: 'active',
    usageFrequency: 'daily',
    paymentMethod: 'Google Pay',
    notes: 'Primary backup for personal photos and Google Drive files.',
  },
  {
    id: 'sub-8',
    name: 'Dropbox Plus',
    category: 'Cloud Storage',
    price: 119.88,
    currency: '$',
    billingCycle: 'yearly',
    nextRenewalDate: getRelativeDate(40), // Redundant storage + never used!
    status: 'active',
    usageFrequency: 'never', // Huge savings opportunity ($119.88/yr wasted)
    paymentMethod: 'PayPal (user@domain.com)',
    notes: 'Old portfolio backup from 2023. Not synced in 6 months.',
  },
  {
    id: 'sub-9',
    name: 'Spotify Premium',
    category: 'Music & Audio',
    price: 10.99,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(11),
    status: 'active',
    usageFrequency: 'daily',
    paymentMethod: 'Apple Pay',
    notes: 'Individual student/standard plan.',
  },
  {
    id: 'sub-10',
    name: 'Figma Professional',
    category: 'Productivity',
    price: 15.0,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(19),
    status: 'active',
    usageFrequency: 'weekly',
    paymentMethod: 'Visa •••• 4242',
    notes: 'UI/UX design workspace for client projects.',
  },
  {
    id: 'sub-11',
    name: 'Equinox Gym Membership',
    category: 'Health & Fitness',
    price: 65.0,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: getRelativeDate(25),
    status: 'paused',
    usageFrequency: 'never',
    paymentMethod: 'Bank Direct Debit',
    notes: 'Currently paused during summer travel.',
  },
]
