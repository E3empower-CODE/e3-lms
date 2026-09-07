// Vitest setup: jest-dom matchers, DOM cleanup, and the MSW API mock server.
import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './msw/server'

// Fail fast on requests no handler covers, so tests can't silently pass on a
// real (or missing) endpoint.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
