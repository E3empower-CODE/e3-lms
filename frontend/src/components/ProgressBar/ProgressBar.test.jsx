import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('clamps and rounds the server value to 0–100', () => {
    const { rerender } = render(<ProgressBar value={150} label="Progress" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')

    rerender(<ProgressBar value={-10} label="Progress" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

    rerender(<ProgressBar value={42.6} label="Progress" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '43')
  })

  it('exposes an accessible name from the label', () => {
    render(<ProgressBar value={30} label="Course progress" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Course progress')
  })
})
