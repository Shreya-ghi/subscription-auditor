import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DeleteConfirmModal from './DeleteConfirmModal'

describe('DeleteConfirmModal component', () => {
  const sampleSubscription = {
    id: 'sub-123',
    name: 'Netflix Premium',
    price: 19.99,
    currency: '$',
    billingCycle: 'monthly',
    category: 'Streaming & Media',
  }

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        subscription={sampleSubscription}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when subscription is null even if isOpen is true', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={true}
        subscription={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders dialog and subscription details when isOpen is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        subscription={sampleSubscription}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Subscription?')).toBeInTheDocument()
    expect(screen.getByText('Netflix Premium')).toBeInTheDocument()
    expect(screen.getByText('$19.99 / monthly')).toBeInTheDocument()
    expect(screen.getByText('Streaming & Media')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, delete subscription/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <DeleteConfirmModal
        isOpen={true}
        subscription={sampleSubscription}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm with subscription.id and onClose when confirmation button is clicked', () => {
    const handleClose = vi.fn()
    const handleConfirm = vi.fn()

    render(
      <DeleteConfirmModal
        isOpen={true}
        subscription={sampleSubscription}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /yes, delete subscription/i }))
    expect(handleConfirm).toHaveBeenCalledWith('sub-123')
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
