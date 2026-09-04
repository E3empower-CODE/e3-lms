import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Users, Clock, CheckCircle2, ListChecks } from 'lucide-react'
import { StatCard } from '../../components/StatCard/StatCard'
import { Card } from '../../components/Card/Card'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchAdmissionsMetrics } from './admissionsApi'
import { STATUS, STATUS_LABELS } from './status'
import styles from './AdmissionsDashboard.module.css'

export function AdmissionsDashboard() {
  const load = useCallback(() => fetchAdmissionsMetrics(), [])
  const { status, data, error, retry } = useAsync(load, [])

  const byStatus = data?.by_status ?? {}
  const total =
    data?.total_applications ??
    Object.values(byStatus).reduce((sum, n) => sum + Number(n || 0), 0)

  const chartData = Object.entries(STATUS_LABELS).map(([code, label]) => ({
    label,
    count: Number(byStatus[code] || 0),
  }))

  return (
    <div>
      <div className={styles.headRow}>
        <h1 className={styles.title}>Admissions</h1>
        <Link className={styles.viewAll} to="/admin/applications">
          View all applications
        </Link>
      </div>

      <DataState status={status} error={error} onRetry={retry}>
        <div className={styles.stats}>
          <StatCard label="Total applications" value={total} icon={Users} />
          <StatCard
            label={STATUS_LABELS[STATUS.PENDING]}
            value={byStatus[STATUS.PENDING] ?? 0}
            icon={Clock}
          />
          <StatCard
            label={STATUS_LABELS[STATUS.UNDER_REVIEW]}
            value={byStatus[STATUS.UNDER_REVIEW] ?? 0}
            icon={ListChecks}
          />
          <StatCard
            label={STATUS_LABELS[STATUS.APPROVED]}
            value={byStatus[STATUS.APPROVED] ?? 0}
            icon={CheckCircle2}
          />
        </div>

        <Card title="Applications by status" className={styles.chartCard}>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'var(--color-primary-soft)' }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className={styles.srSummary}>
            {chartData.map((d) => `${d.label}: ${d.count}.`).join(' ')}
          </p>
        </Card>
      </DataState>
    </div>
  )
}
