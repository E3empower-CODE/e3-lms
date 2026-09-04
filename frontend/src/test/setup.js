// Vitest setup: extend expect with jest-dom matchers and clean up the DOM
// between tests. Imported via vite.config.js `test.setupFiles`.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
