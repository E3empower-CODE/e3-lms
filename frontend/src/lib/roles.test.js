import { describe, it, expect } from 'vitest'
import { ROLES, homePathForRole, roleLabel, canConvertApplications } from './roles'

describe('homePathForRole', () => {
  it('routes admin roles to /admin', () => {
    expect(homePathForRole(ROLES.SUPER_ADMIN)).toBe('/admin')
    expect(homePathForRole(ROLES.ADMISSIONS)).toBe('/admin')
    expect(homePathForRole(ROLES.FINANCE)).toBe('/admin')
  })

  it('routes instructor and student to their shells', () => {
    expect(homePathForRole(ROLES.INSTRUCTOR)).toBe('/instructor')
    expect(homePathForRole(ROLES.STUDENT)).toBe('/student')
  })

  it('falls back to /login for an unknown role', () => {
    expect(homePathForRole('mystery')).toBe('/login')
    expect(homePathForRole(undefined)).toBe('/login')
  })
})

describe('roleLabel', () => {
  it('gives a human label, with a safe default', () => {
    expect(roleLabel(ROLES.FINANCE)).toBe('Finance Officer')
    expect(roleLabel('mystery')).toBe('User')
  })
})

describe('canConvertApplications', () => {
  it('allows super admin and admissions only', () => {
    expect(canConvertApplications(ROLES.SUPER_ADMIN)).toBe(true)
    expect(canConvertApplications(ROLES.ADMISSIONS)).toBe(true)
    expect(canConvertApplications(ROLES.FINANCE)).toBe(false)
    expect(canConvertApplications(ROLES.INSTRUCTOR)).toBe(false)
    expect(canConvertApplications(undefined)).toBe(false)
  })
})
