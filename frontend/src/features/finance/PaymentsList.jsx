import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Select } from '../../components/Select/Select'
import { DataState } from '../../components/DataState/DataState'
import { Pagination } from '../../components/Pagination/Pagination'
import { useAsync } from '../../hooks/useAsync'
import { fetchPayments } from './financeApi'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  PAYMENT_STATUS_FILTER_OPTIONS,
  methodLabel,
  canReverse,
} from './status'
import { RecordPaymentDialog } from './RecordPaymentDialog'
import { ReversePaymentDialog } from './ReversePaymentDialog'
import { formatMoney, formatDate } from '../../lib/format'
import styles from './PaymentsList.module.css'

export function PaymentsList() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const search = params.get('q') || ''
  const status = params.get('status') || ''
  const [searchInput, setSearchInput] = useState(search)
  const [recordOpen, setRecordOpen] = useState(false)
  const [reversing, setReversing] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(
    () => fetchPayments({ page, search, status }),
    [page, search, status],
  )
  // reloadKey forces a refetch after a record/reverse mutation.
  const { status: reqStatus, data, error, retry, setData } = useAsync(load, [
    page,
    search,
    status,
    reloadKey,
  ])

  const setQuery = (next) => {
    const merged = { q: search, status, page: '1', ...next }
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== '' && v != null),
    )
    setParams(clean)
  }

  const rows = data?.rows ?? []
  const pagination = data?.pagination ?? {}

  return (
    <div>
      <div className={styles.headRow}>
        <h1 className={styles.title}>Payments</h1>
        <Button onClick={() => setRecordOpen(true)}>
          <Plus className={styles.plus} aria-hidden="true" />
          Record payment
        </Button>
      </div>

      <Card className={styles.filters}>
        <form
          className={styles.searchForm}
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            setQuery({ q: searchInput, page: '1' })
          }}
        >
          <div className={styles.searchField}>
            <label htmlFor="pay-search" className={styles.srOnly}>Search payments</label>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
              id="pay-search"
              className={styles.searchInput}
              type="search"
              placeholder="Search by student or receipt"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        <Select
          aria-label="Filter by status"
          className={styles.statusFilter}
          options={PAYMENT_STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(e) => setQuery({ status: e.target.value, page: '1' })}
        />
      </Card>

      <DataState
        status={reqStatus}
        error={error}
        onRetry={retry}
        isEmpty={reqStatus === 'success' && rows.length === 0}
        empty={{ title: 'No payments found', description: 'Recorded payments appear here.' }}
      >
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Receipt</th>
                <th scope="col">Student</th>
                <th scope="col">Amount</th>
                <th scope="col">Method</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col"><span className={styles.srOnly}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className={styles.mono}>{p.receipt_number || '—'}</td>
                  <td>{p.student_name || '—'}</td>
                  <td className={styles.amount}>{formatMoney(p.amount)}</td>
                  <td className={styles.muted}>{methodLabel(p.method)}</td>
                  <td className={styles.muted}>{formatDate(p.paid_on)}</td>
                  <td>
                    <Badge variant={PAYMENT_STATUS_VARIANTS[p.status] || 'neutral'}>
                      {PAYMENT_STATUS_LABELS[p.status] || p.status}
                    </Badge>
                  </td>
                  <td className={styles.actionCell}>
                    {canReverse(p.status) && (
                      <Button variant="ghost" onClick={() => setReversing(p)}>
                        Reverse
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.cards}>
          {rows.map((p) => (
            <li key={p.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.amount}>{formatMoney(p.amount)}</span>
                <Badge variant={PAYMENT_STATUS_VARIANTS[p.status] || 'neutral'}>
                  {PAYMENT_STATUS_LABELS[p.status] || p.status}
                </Badge>
              </div>
              <p className={styles.cardName}>{p.student_name || '—'}</p>
              <p className={styles.muted}>
                {p.receipt_number ? `${p.receipt_number} · ` : ''}
                {methodLabel(p.method)} · {formatDate(p.paid_on)}
              </p>
              {canReverse(p.status) && (
                <Button variant="ghost" onClick={() => setReversing(p)} className={styles.cardAction}>
                  Reverse
                </Button>
              )}
            </li>
          ))}
        </ul>

        <Pagination
          page={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          onChange={(pg) => setQuery({ page: String(pg) })}
        />
      </DataState>

      <RecordPaymentDialog
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onRecorded={() => setReloadKey((k) => k + 1)}
      />
      <ReversePaymentDialog
        payment={reversing}
        onClose={() => setReversing(null)}
        onReversed={(updated) => {
          setData((prev) => ({
            ...prev,
            rows: (prev?.rows ?? []).map((r) =>
              r.id === updated.id ? { ...r, ...updated } : r,
            ),
          }))
          setReversing(null)
        }}
      />
    </div>
  )
}
