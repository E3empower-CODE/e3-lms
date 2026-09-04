import { useCallback, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Download } from 'lucide-react'
import { Card } from '../../components/Card/Card'
import { Button } from '../../components/Button/Button'
import { Select } from '../../components/Select/Select'
import { Input } from '../../components/Input/Input'
import { StatCard } from '../../components/StatCard/StatCard'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchReport, REPORT_TYPES } from './reportsApi'
import { toCsv, downloadCsv } from './csv'
import styles from './ReportsPage.module.css'

export function ReportsPage() {
  const [type, setType] = useState(REPORT_TYPES[0].value)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = useCallback(
    () => fetchReport(type, { from: from || undefined, to: to || undefined }),
    [type, from, to],
  )
  const { status, data, error, retry } = useAsync(load, [type, from, to])

  const summary = data?.summary ?? []
  const series = data?.series ?? []
  const columns = data?.columns ?? []
  const rows = data?.rows ?? []

  const exportCsv = () => {
    if (columns.length === 0 || rows.length === 0) return
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`e3-${type}-report-${stamp}.csv`, toCsv(columns, rows))
  }

  return (
    <div>
      <div className={styles.headRow}>
        <h1 className={styles.title}>Reports</h1>
        <Button
          variant="secondary"
          onClick={exportCsv}
          disabled={status !== 'success' || rows.length === 0}
        >
          <Download className={styles.icon} aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <Card className={styles.filters}>
        <Select
          label="Report"
          options={REPORT_TYPES}
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={styles.filterField}
        />
        <Input
          label="From"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setFrom(e.target.value)}
          className={styles.filterField}
        />
        <Input
          label="To"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setTo(e.target.value)}
          className={styles.filterField}
        />
      </Card>

      <DataState status={status} error={error} onRetry={retry}>
        {summary.length > 0 && (
          <div className={styles.stats}>
            {summary.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        )}

        {series.length > 0 && (
          <Card title="Trend" className={styles.chartCard}>
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={series} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'var(--color-primary-soft)' }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {columns.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} scope="col">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id ?? i}>
                    {columns.map((c) => (
                      <td key={c.key}>{row[c.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {summary.length === 0 && series.length === 0 && rows.length === 0 && (
          <p className={styles.muted}>No data for the selected filters.</p>
        )}
      </DataState>
    </div>
  )
}
