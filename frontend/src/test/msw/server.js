import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Shared MSW server for the vitest (node) environment. */
export const server = setupServer(...handlers)
