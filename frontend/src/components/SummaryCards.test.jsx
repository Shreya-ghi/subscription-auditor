import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SummaryCards from './SummaryCards'

describe('SummaryCards component', () => {
  it('renders default values when no props are passed', () => {
    render(<SummaryCards />)

    expect(screen.getByText('Monthly Recurring Expenses')).toBeInTheDocument()
    expect(screen.getByText('Annual Projected Expenses')).toBeInTheDocument()
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Renewals (7 Days)')).toBeInTheDocument()

    // 0 values formatted
    expect(screen.getAllByText('$0.00')).toHaveLength(2)
    expect(screen.getByText('No active subs')).toBeInTheDocument()
    expect(screen.getByText('No renewals due this week')).toBeInTheDocument()
    expect(screen.getByText('Up to date')).toBeInTheDocument()
  })

  it('renders provided metrics and custom currency symbol', () => {
    render(
      <SummaryCards
        totalMonthly={245.5}
        totalAnnual={2946}
        activeCount={8}
        pausedCount={2}
        totalCount={10}
        upcomingRenewalsCount={3}
        upcomingRenewalsCost={65.99}
        currency="€"
      />
    )

    expect(screen.getByText('€245.50')).toBeInTheDocument()
    expect(screen.getByText('Projected €2,946.00/year')).toBeInTheDocument()
    expect(screen.getByText('€2,946.00')).toBeInTheDocument()
    expect(screen.getByText('Averages €245.50/mo')).toBeInTheDocument()

    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('2 paused • 10 total tracked')).toBeInTheDocument()
    expect(screen.getByText('Operational')).toBeInTheDocument()

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('€65.99 due this week')).toBeInTheDocument()
    expect(screen.getByText('Action suggested')).toBeInTheDocument()
  })

  it('invokes onSelectTab with appropriate tab identifier on click', () => {
    const handleSelectTab = vi.fn()

    render(
      <SummaryCards
        totalMonthly={100}
        totalAnnual={1200}
        activeCount={5}
        upcomingRenewalsCount={1}
        onSelectTab={handleSelectTab}
      />
    )

    // Click Monthly Recurring Expenses card -> navigates to 'subscriptions'
    fireEvent.click(screen.getByText('Monthly Recurring Expenses').closest('.cursor-pointer'))
    expect(handleSelectTab).toHaveBeenCalledWith('subscriptions')

    // Click Annual Projected Expenses card -> navigates to 'analytics'
    fireEvent.click(screen.getByText('Annual Projected Expenses').closest('.cursor-pointer'))
    expect(handleSelectTab).toHaveBeenCalledWith('analytics')

    // Click Upcoming Renewals card -> navigates to 'renewals'
    fireEvent.click(screen.getByText('Upcoming Renewals (7 Days)').closest('.cursor-pointer'))
    expect(handleSelectTab).toHaveBeenCalledWith('renewals')
  })
})
