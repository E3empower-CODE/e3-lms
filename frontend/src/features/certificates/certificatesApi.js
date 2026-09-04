import { apiClient } from '../../lib/apiClient'
import { rows, pageInfo, listParams } from '../../lib/pagination'

/**
 * Certificate reads/writes. Issuance is restricted, idempotent, and audited
 * server-side (one unique certificate per eligible enrollment).
 */
const CERTS = import.meta.env.VITE_CERTIFICATES_PATH || '/certificates/'
const ME = import.meta.env.VITE_ME_PATH || '/me'

/** Issued certificates (admin). */
export async function fetchCertificates({ page, search } = {}) {
  const response = await apiClient.get(CERTS, {
    params: listParams({ page, search, ordering: '-issued_on' }),
  })
  return { rows: rows(response), pagination: pageInfo(response) }
}

/** Completed enrollments eligible for issuance but not yet certified. */
export async function fetchEligibleEnrollments() {
  const response = await apiClient.get(`${CERTS}eligible/`)
  return rows(response)
}

/** Issue a certificate for an enrollment (idempotent; returns the certificate). */
export async function issueCertificate(enrollmentId) {
  const response = await apiClient.post(CERTS, { enrollment_id: enrollmentId })
  return response.data
}

/** The current student's own certificates. */
export async function fetchMyCertificates() {
  const response = await apiClient.get(`${ME}/certificates/`)
  return rows(response)
}
