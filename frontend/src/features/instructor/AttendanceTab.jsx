import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Input } from '../../components/Input/Input'
import { Select } from '../../components/Select/Select'
import { Alert } from '../../components/Alert/Alert'
import { DataState } from '../../components/DataState/DataState'
import { useAsync } from '../../hooks/useAsync'
import { fetchClassAttendance, saveClassAttendance } from './attendanceApi'
import { ATTENDANCE_OPTIONS, ATTENDANCE_STATUS } from '../attendance/status'
import styles from './AttendanceTab.module.css'

const today = () => new Date().toISOString().slice(0, 10)

function studentName(r) {
  return r.name || r.student_name || [r.first_name, r.last_name].filter(Boolean).join(' ') || '—'
}

export function AttendanceTab({ classId }) {
  const [date, setDate] = useState(today())
  const load = useCallback(() => fetchClassAttendance(classId, date), [classId, date])
  const { status, data, error, retry } = useAsync(load, [classId, date])

  const [marks, setMarks] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  const records = data?.records ?? []

  // Seed marks from server records (default unmarked to present) when data loads.
  useEffect(() => {
    if (status !== 'success') return
    const seed = {}
    for (const r of records) {
      seed[r.student_id ?? r.id] = r.status || ATTENDANCE_STATUS.PRESENT
    }
    setMarks(seed)
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data])

  const setMark = (studentId, value) => {
    setMarks((prev) => ({ ...prev, [studentId]: value }))
    setSaved(false)
  }

  const markAllPresent = () => {
    const all = {}
    for (const r of records) all[r.student_id ?? r.id] = ATTENDANCE_STATUS.PRESENT
    setMarks(all)
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      const payload = records.map((r) => {
        const sid = r.student_id ?? r.id
        return { student_id: sid, status: marks[sid] || ATTENDANCE_STATUS.PRESENT }
      })
      await saveClassAttendance(classId, date, payload)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className={styles.controls}>
        <Input
          label="Date"
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          className={styles.dateInput}
        />
        <Button variant="secondary" onClick={markAllPresent} className={styles.bulk}>
          Mark all present
        </Button>
      </div>

      <DataState
        status={status}
        error={error}
        onRetry={retry}
        isEmpty={status === 'success' && records.length === 0}
        empty={{ title: 'No students to mark', description: 'This class has no enrolled students.' }}
      >
        <ul className={styles.roster}>
          {records.map((r) => {
            const sid = r.student_id ?? r.id
            return (
              <li key={sid} className={styles.row}>
                <span className={styles.name}>{studentName(r)}</span>
                <Select
                  aria-label={`Attendance for ${studentName(r)}`}
                  className={styles.statusSelect}
                  options={ATTENDANCE_OPTIONS}
                  value={marks[sid] || ATTENDANCE_STATUS.PRESENT}
                  onChange={(e) => setMark(sid, e.target.value)}
                />
              </li>
            )
          })}
        </ul>

        {saveError && <Alert variant="error" className={styles.feedback}>{saveError}</Alert>}
        {saved && <Alert variant="success" className={styles.feedback}>Attendance saved.</Alert>}

        {records.length > 0 && (
          <div className={styles.actions}>
            <Button onClick={save} loading={saving}>
              Save attendance
            </Button>
          </div>
        )}
      </DataState>
    </div>
  )
}
