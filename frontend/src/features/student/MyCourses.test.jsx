import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { http } from 'msw'
import { server } from '../../test/msw/server'
import { API_BASE, collection, apiError } from '../../test/msw/handlers'
import { MyCourses } from './MyCourses'

function renderPage() {
  return render(
    <MemoryRouter>
      <MyCourses />
    </MemoryRouter>,
  )
}

describe('MyCourses (integration, MSW)', () => {
  it('renders enrolled courses from the collection envelope', async () => {
    server.use(
      http.get(`${API_BASE}/me/courses/`, () =>
        collection([
          { id: 1, name: 'Python 3 Beginner', progress_percent: 40 },
          { id: 2, name: 'Web Basics', progress_percent: 100 },
        ]),
      ),
    )
    renderPage()

    expect(await screen.findByText('Python 3 Beginner')).toBeInTheDocument()
    expect(screen.getByText('Web Basics')).toBeInTheDocument()
    // Completed course shows its badge.
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows the empty state when there are no courses', async () => {
    server.use(http.get(`${API_BASE}/me/courses/`, () => collection([])))
    renderPage()
    expect(await screen.findByText('No courses yet')).toBeInTheDocument()
  })

  it('shows the error state and message from the error envelope', async () => {
    server.use(
      http.get(`${API_BASE}/me/courses/`, () =>
        apiError(500, 'SERVER_ERROR', 'Something went wrong. Please try again.'),
      ),
    )
    renderPage()
    expect(await screen.findByText(/couldn’t load/i)).toBeInTheDocument()
  })
})
