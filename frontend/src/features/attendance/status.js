/** Attendance status model (wire codes snake_case). */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
}

export const ATTENDANCE_STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
}

export const ATTENDANCE_STATUS_VARIANTS = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
}

export const ATTENDANCE_OPTIONS = Object.entries(ATTENDANCE_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
)

const CYCLE = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.EXCUSED,
]

/** Next status when tapping a roster row (present → absent → late → excused → …). */
export function nextStatus(status) {
  const i = CYCLE.indexOf(status)
  return CYCLE[(i + 1) % CYCLE.length]
}
