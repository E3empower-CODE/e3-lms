import { test, expect } from '@playwright/test'

/**
 * Smoke tests that run without a backend: the current-user bootstrap fails
 * (no API), so the app resolves to the unauthenticated public shell. These
 * prove the app boots, routing works, and the public flows are reachable.
 * A full register→certificate journey is added once the API is available.
 */

test('an unauthenticated visitor is routed to sign in', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
})

test('the login form validates required fields', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Email is required')).toBeVisible()
  await expect(page.getByText('Password is required')).toBeVisible()
})

test('a visitor can reach the registration wizard', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Create an account' }).click()
  await expect(page).toHaveURL(/\/register$/)
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible()
  // The wizard opens on the Applicant step.
  await expect(page.getByLabel('First name')).toBeVisible()
})

test('unknown routes render the not-found page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByText('Page not found')).toBeVisible()
})
