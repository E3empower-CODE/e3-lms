import { useCallback } from 'react'
import { Wallet, CheckCircle2, AlertCircle } from 'lucide-react'
import { StatCard } from '../../components/StatCard/StatCard'
import { Badge } from '../../components/Badge/Badge'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchMyBalance, fetchMyPayments } from './meApi'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  methodLabel,
} from '../finance/status'
import { formatMoney, formatDate } from '../../lib/format'
import styles from './StudentPayments.module.css'

export function StudentPayments() {
  const loadBalance = useCallback(() => fetchMyBalance(), [])
  const loadPayments = useCallback(() => fetchMyPayments(), [])
  const balance = useAsync(loadBalance, [])
  const payments = useAsync(loadPayments, [])

  const b = balance.data
  const history = payments.data ?? []

  return (
    <div>
      <h1 className={styles.title}>Payments</h1>

      <DataState status={balance.status} error={balance.error} onRetry={balance.retry}>
        <div className={styles.stats}>
          <StatCard label="Fees" value={formatMoney(b?.fee_total)} icon={Wallet} />
          <StatCard label="Paid" value={formatMoney(b?.paid_total)} icon={CheckCircle2} />
          <StatCard label="Outstanding" value={formatMoney(b?.outstanding)} icon={AlertCircle} />
        </div>
      </DataState>

      <h2 className={styles.sectionTitle}>Payment history</h2>
      <DataState
        status={payments.status}
        error={payments.error}
        onRetry={payments.retry}
        isEmpty={payments.status === 'success' && history.length === 0}
        empty={{
          icon: Wallet,
          title: 'No payments yet',
          description: 'Payments recorded for you will appear here.',
        }}
      >
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Receipt</th>
                <th scope="col">Amount</th>
                <th scope="col">Method</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.id}>
                  <td className={styles.mono}>{p.receipt_number || '—'}</td>
                  <td className={styles.amount}>{formatMoney(p.amount)}</td>
                  <td className={styles.muted}>{methodLabel(p.method)}</td>
                  <td className={styles.muted}>{formatDate(p.paid_on)}</td>
                  <td>
                    <Badge variant={PAYMENT_STATUS_VARIANTS[p.status] || 'neutral'}>
                      {PAYMENT_STATUS_LABELS[p.status] || p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.cards}>
          {history.map((p) => (
            <li key={p.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.amount}>{formatMoney(p.amount)}</span>
                <Badge variant={PAYMENT_STATUS_VARIANTS[p.status] || 'neutral'}>
                  {PAYMENT_STATUS_LABELS[p.status] || p.status}
                </Badge>
              </div>
              <p className={styles.muted}>
                {p.receipt_number ? `${p.receipt_number} · ` : ''}
                {methodLabel(p.method)} · {formatDate(p.paid_on)}
              </p>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}
