import { z } from 'zod'

// Shared option lists (values are snake_case wire codes).
export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'other', label: 'Other' },
]

export const SESSION_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
]

export const REFERRAL_SOURCES = [
  { value: 'friend_family', label: 'Friend or family' },
  { value: 'social_media', label: 'Social media' },
  { value: 'search', label: 'Web search' },
  { value: 'event', label: 'Event or fair' },
  { value: 'other', label: 'Other' },
]

const requiredString = (label) =>
  z.string().trim().min(1, `${label} is required`)

const notFutureDate = z
  .string()
  .min(1, 'Birth date is required')
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00`).getTime()), {
    message: 'Enter a valid date',
  })
  .refine((v) => new Date(`${v}T00:00:00`) <= new Date(), {
    message: 'Birth date cannot be in the future',
  })

export const applicantSchema = z.object({
  first_name: requiredString('First name'),
  last_name: requiredString('Last name'),
  birth_date: notFutureDate,
  gender: z.enum(['female', 'male', 'other', 'prefer_not_to_say'], {
    message: 'Select a gender',
  }),
  nationality: requiredString('Nationality'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: requiredString('Phone number'),
  address_line: requiredString('Address'),
  city: requiredString('City'),
  state_region: requiredString('State/Region'),
  country: requiredString('Country'),
})

export const educationSchema = z
  .object({
    education_level: z.enum(
      EDUCATION_LEVELS.map((o) => o.value),
      { message: 'Select an education level' },
    ),
    institution: requiredString('Institution'),
    current_level: z.string().trim().optional().default(''),
    previous_computer_training: z.boolean().default(false),
    training_description: z.string().trim().optional().default(''),
  })
  .refine(
    (d) => !d.previous_computer_training || d.training_description.length > 0,
    {
      path: ['training_description'],
      message: 'Describe your previous computer training',
    },
  )

export const guardianSchema = z.object({
  guardian_full_name: requiredString('Guardian name'),
  guardian_relationship: requiredString('Relationship'),
  guardian_phone: requiredString('Guardian phone'),
  guardian_email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
})

export const emergencySchema = z.object({
  emergency_name: requiredString('Contact name'),
  emergency_relationship: requiredString('Relationship'),
  emergency_phone: requiredString('Phone number'),
  emergency_alt_phone: z.string().trim().optional().default(''),
  emergency_email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
})

export const coursesSchema = z.object({
  course_ids: z.array(z.number()).min(1, 'Select at least one course'),
  preferred_start_date: requiredString('Preferred start date'),
  preferred_session: z.enum(['morning', 'afternoon', 'evening'], {
    message: 'Select a preferred session',
  }),
})

export const additionalSchema = z.object({
  has_computer_access: z.boolean().default(false),
  reason_for_joining: requiredString('Reason for joining'),
  referral_source: z.enum(
    REFERRAL_SOURCES.map((o) => o.value),
    { message: 'Select a referral source' },
  ),
})

export const declarationSchema = z.object({
  declaration_accepted: z.literal(true, {
    message: 'You must confirm the declaration to submit',
  }),
})
