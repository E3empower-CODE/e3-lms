import { describe, it, expect } from 'vitest'
import {
  educationSchema,
  coursesSchema,
  declarationSchema,
} from './schemas'

describe('educationSchema', () => {
  const base = {
    education_level: 'secondary',
    institution: 'Central High',
    current_level: '',
  }

  it('requires a description only when previous training is checked', () => {
    expect(
      educationSchema.safeParse({
        ...base,
        previous_computer_training: false,
        training_description: '',
      }).success,
    ).toBe(true)

    const withTraining = educationSchema.safeParse({
      ...base,
      previous_computer_training: true,
      training_description: '',
    })
    expect(withTraining.success).toBe(false)
  })
})

describe('coursesSchema', () => {
  it('requires at least one course and a session', () => {
    expect(
      coursesSchema.safeParse({
        course_ids: [],
        preferred_start_date: '2026-10-01',
        preferred_session: 'morning',
      }).success,
    ).toBe(false)

    expect(
      coursesSchema.safeParse({
        course_ids: [1, 2],
        preferred_start_date: '2026-10-01',
        preferred_session: 'morning',
      }).success,
    ).toBe(true)
  })
})

describe('declarationSchema', () => {
  it('requires the declaration to be accepted', () => {
    expect(declarationSchema.safeParse({ declaration_accepted: false }).success).toBe(false)
    expect(declarationSchema.safeParse({ declaration_accepted: true }).success).toBe(true)
  })
})
